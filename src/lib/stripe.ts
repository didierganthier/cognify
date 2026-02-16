import Stripe from 'stripe';

// Determine which mode to use (test or live)
const stripeMode = process.env.STRIPE_MODE || 'test';
const isLiveMode = stripeMode === 'live';

// Get the appropriate secret key based on mode
const secretKey = isLiveMode 
  ? process.env.STRIPE_SECRET_KEY_LIVE 
  : process.env.STRIPE_SECRET_KEY_TEST;

if (!secretKey) {
  throw new Error(`STRIPE_SECRET_KEY_${stripeMode.toUpperCase()} is not set in environment variables`);
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Get webhook secret based on mode
export const stripeWebhookSecret = isLiveMode
  ? process.env.STRIPE_WEBHOOK_SECRET_LIVE!
  : process.env.STRIPE_WEBHOOK_SECRET_TEST!;

// Price IDs based on mode
export const STRIPE_PRICES = {
  monthly: isLiveMode 
    ? process.env.STRIPE_PRICE_MONTHLY_LIVE || ''
    : process.env.STRIPE_PRICE_MONTHLY_TEST || '',
  yearly: isLiveMode 
    ? process.env.STRIPE_PRICE_YEARLY_LIVE || ''
    : process.env.STRIPE_PRICE_YEARLY_TEST || '',
  lifetime: isLiveMode 
    ? process.env.STRIPE_PRICE_LIFETIME_LIVE || ''
    : process.env.STRIPE_PRICE_LIFETIME_TEST || '',
};

// Helper to get price ID based on billing period
export function getPriceId(period: 'monthly' | 'yearly' | 'lifetime'): string {
  const priceId = STRIPE_PRICES[period];
  
  if (!priceId) {
    throw new Error(`Price ID for ${period} plan is not configured for ${stripeMode} mode`);
  }
  
  return priceId;
}

// Export mode for debugging
export const isStripeTestMode = !isLiveMode;
