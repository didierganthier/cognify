import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, getPriceId } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { period = 'monthly' } = body;

    // Validate period
    if (!['monthly', 'yearly', 'lifetime'].includes(period)) {
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 });
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const priceId = getPriceId(period as 'monthly' | 'yearly' | 'lifetime');
    const isLifetime = period === 'lifetime';
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionConfig: any = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isLifetime ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      allow_promotion_codes: true,
      metadata: {
        supabase_user_id: user.id,
        plan_type: period,
      },
    };

    // Add subscription metadata only for recurring plans
    if (!isLifetime) {
      sessionConfig.subscription_data = {
        metadata: {
          supabase_user_id: user.id,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
