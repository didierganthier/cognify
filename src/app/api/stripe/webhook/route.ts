import { NextRequest, NextResponse } from 'next/server';
import { stripe, stripeWebhookSecret } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySubscription = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyInvoice = any;

// Use service role for webhook (no user auth)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeWebhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string | null;
  const userId = session.metadata?.supabase_user_id || 
    (await getUserIdByCustomerId(customerId));
  const planType = session.metadata?.plan_type;

  if (!userId) {
    console.error('No user ID found for checkout session');
    return;
  }

  // Handle lifetime purchase (one-time payment)
  if (planType === 'lifetime' || session.mode === 'payment') {
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'lifetime',
        subscription_id: null,
        current_period_end: null, // Lifetime = no expiry
      })
      .eq('id', userId);

    console.log(`Lifetime access activated for user ${userId}`);
    return;
  }

  // Handle recurring subscription
  if (!subscriptionId) {
    console.error('No subscription ID found for checkout session');
    return;
  }

  // Get subscription details
  const subscription: AnySubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const periodEnd = subscription.current_period_end;

  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_id: subscriptionId,
      current_period_end: new Date(periodEnd * 1000).toISOString(),
    })
    .eq('id', userId);

  console.log(`Subscription activated for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription: AnySubscription) {
  const customerId = subscription.customer as string;
  const userId = await getUserIdByCustomerId(customerId);

  if (!userId) {
    console.error('No user ID found for subscription update');
    return;
  }

  const status = mapSubscriptionStatus(subscription.status);
  const periodEnd = subscription.current_period_end;

  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    })
    .eq('id', userId);

  console.log(`Subscription updated for user ${userId}: ${status}`);
}

async function handleSubscriptionDeleted(subscription: AnySubscription) {
  const customerId = subscription.customer as string;
  const userId = await getUserIdByCustomerId(customerId);

  if (!userId) {
    console.error('No user ID found for subscription deletion');
    return;
  }

  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'free',
      subscription_id: null,
      current_period_end: null,
    })
    .eq('id', userId);

  console.log(`Subscription canceled for user ${userId}`);
}

async function handleInvoicePaid(invoice: AnyInvoice) {
  const customerId = invoice.customer as string;
  const userId = await getUserIdByCustomerId(customerId);

  if (!userId) return;

  // Update period end date
  const subscriptionId = invoice.subscription as string | null;
  if (subscriptionId) {
    const subscription: AnySubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const periodEnd = subscription.current_period_end;
    
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'active',
        current_period_end: new Date(periodEnd * 1000).toISOString(),
      })
      .eq('id', userId);
  }

  console.log(`Invoice paid for user ${userId}`);
}

async function handlePaymentFailed(invoice: AnyInvoice) {
  const customerId = invoice.customer as string;
  const userId = await getUserIdByCustomerId(customerId);

  if (!userId) return;

  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', userId);

  console.log(`Payment failed for user ${userId}`);
}

async function getUserIdByCustomerId(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  return data?.id || null;
}

function mapSubscriptionStatus(status: string): string {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'free';
    default:
      return 'free';
  }
}
