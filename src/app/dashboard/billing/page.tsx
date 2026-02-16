'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, Check, Zap, Crown, FileText, Headphones, Brain, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  subscription_status: 'free' | 'active' | 'past_due' | 'canceled' | 'lifetime'
  current_period_end: string | null
  stripe_customer_id: string | null
}

export default function BillingPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [managingBilling, setManagingBilling] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly')
  const [documentsCount, setDocumentsCount] = useState(0)
  const searchParams = useSearchParams()
  
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  const currentPlan = profile?.subscription_status === 'active' || profile?.subscription_status === 'lifetime' ? 'pro' : 'free'
  const isLifetime = profile?.subscription_status === 'lifetime'

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('subscription_status, current_period_end, stripe_customer_id')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData as Profile)
      }

      // Get document count for this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
      
      setDocumentsCount(count || 0)
    }
    
    setLoading(false)
  }

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: billingPeriod }),
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  async function handleManageBilling() {
    setManagingBilling(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to open billing portal')
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setManagingBilling(false)
    }
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out Cognify',
      features: [
        '3 PDFs per month',
        'AI-powered summaries',
        'Interactive quizzes',
        'Basic support',
      ],
      limitations: [
        'No audio generation',
        'Limited to 10MB files',
      ],
      current: currentPlan === 'free',
    },
    {
      name: 'Pro',
      price: billingPeriod === 'monthly' ? '$12' : billingPeriod === 'yearly' ? '$99' : '$199',
      period: billingPeriod === 'monthly' ? '/month' : billingPeriod === 'yearly' ? '/year' : ' one-time',
      description: billingPeriod === 'lifetime' ? 'Pay once, use forever' : 'For serious learners and students',
      features: [
        'Unlimited PDFs',
        'AI-powered summaries',
        'Interactive quizzes',
        'Audio narration (TTS)',
        'Priority support',
        'Up to 50MB files',
        'Export study materials',
        ...(billingPeriod === 'lifetime' ? ['Lifetime access', 'All future updates'] : []),
      ],
      limitations: [],
      current: currentPlan === 'pro',
      popular: true,
      savings: billingPeriod === 'yearly' ? 'Save $45/year' : billingPeriod === 'lifetime' ? 'Best Value' : null,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Success/Cancel Messages */}
      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            🎉 Welcome to Pro! Your subscription is now active. Enjoy unlimited features!
          </AlertDescription>
        </Alert>
      )}

      {canceled && (
        <Alert>
          <AlertDescription>
            Checkout was canceled. No charges were made. Feel free to upgrade whenever you&apos;re ready!
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan Status */}
      <Card className={currentPlan === 'pro' ? 'border-primary' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentPlan === 'pro' ? (
              <Crown className="h-5 w-5 text-yellow-500" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
            Current Plan: {currentPlan === 'pro' ? (isLifetime ? 'Pro (Lifetime)' : 'Pro') : 'Free'}
            {isLifetime && <Badge className="ml-2 bg-green-100 text-green-700">Forever</Badge>}
          </CardTitle>
          <CardDescription>
            {isLifetime ? (
              <>You have lifetime access to all Pro features. Thank you for your support!</>
            ) : currentPlan === 'pro' && profile?.current_period_end ? (
              <>Your subscription renews on {new Date(profile.current_period_end).toLocaleDateString()}</>
            ) : (
              <>You&apos;re on the free plan with limited features</>
            )}
          </CardDescription>
        </CardHeader>
        {currentPlan === 'pro' && !isLifetime && (
          <CardContent>
            <Button variant="outline" onClick={handleManageBilling} disabled={managingBilling}>
              {managingBilling ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Manage Subscription
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Current Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Current Usage
          </CardTitle>
          <CardDescription>
            Your PDF processing usage this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Documents Processed</span>
              <span className="text-sm text-muted-foreground">
                {documentsCount} / {currentPlan === 'pro' ? '∞' : 3}
              </span>
            </div>
            {currentPlan === 'free' && (
              <>
                <Progress value={(documentsCount / 3) * 100} />
                <p className="text-xs text-muted-foreground">
                  {Math.max(0, 3 - documentsCount)} documents remaining this month. Resets on the 1st.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      {currentPlan === 'free' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Choose Your Plan</h2>
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  billingPeriod === 'monthly' 
                    ? 'bg-background shadow text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  billingPeriod === 'yearly' 
                    ? 'bg-background shadow text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Yearly
                <Badge variant="secondary" className="ml-1 text-xs">-30%</Badge>
              </button>
              <button
                onClick={() => setBillingPeriod('lifetime')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  billingPeriod === 'lifetime' 
                    ? 'bg-background shadow text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Lifetime
                <Badge variant="secondary" className="ml-1 text-xs bg-green-100 text-green-700">Best</Badge>
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {plan.name === 'Pro' ? (
                        <Crown className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <Zap className="h-5 w-5" />
                      )}
                      {plan.name}
                    </CardTitle>
                    {plan.current && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                    {plan.savings && (
                      <Badge variant="secondary" className="ml-2 text-green-600">
                        {plan.savings}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {plan.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-4 w-4 flex items-center justify-center shrink-0">✕</span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                  {plan.name === 'Pro' ? (
                    <Button 
                      className="w-full" 
                      onClick={handleUpgrade}
                      disabled={upgrading}
                    >
                      {upgrading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Upgrade to Pro'
                      )}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      disabled
                    >
                      Current Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pro Features Highlight */}
      {currentPlan === 'free' && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Unlock Pro Features</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Get unlimited PDFs, audio narration, and priority support.
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4 text-primary" />
                    <span>Unlimited AI summaries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Headphones className="h-4 w-4 text-primary" />
                    <span>Audio narration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>50MB file uploads</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method - Show for Pro users */}
      {currentPlan === 'pro' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
            <CardDescription>
              Manage your payment details through Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleManageBilling} disabled={managingBilling}>
              {managingBilling ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Update Payment Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
