-- Migration: Add Stripe subscription fields to profiles
-- Run this in your Supabase SQL Editor

-- Add Stripe-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'past_due', 'canceled', 'lifetime')),
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- Comment for documentation
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID (cus_xxx)';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current subscription status: free, active, past_due, canceled, lifetime';
COMMENT ON COLUMN public.profiles.subscription_id IS 'Stripe subscription ID (sub_xxx)';
COMMENT ON COLUMN public.profiles.current_period_end IS 'When the current billing period ends (null for lifetime)';
