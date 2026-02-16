'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Loader2, Check, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Show email confirmation message
      setIsEmailSent(true);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'AI-powered summaries',
    'Auto-generated quizzes',
    'Audio playback',
    '3 free PDFs per month',
  ];

  // Email confirmation sent screen
  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
              <Mail className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification link to
            </CardDescription>
            <p className="font-medium text-foreground mt-1">{email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="mb-2">Click the link in the email to verify your account and start learning!</p>
              <p>Didn&apos;t receive the email? Check your spam folder or</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full h-11"
              onClick={async () => {
                setIsLoading(true);
                await supabase.auth.resend({
                  type: 'signup',
                  email,
                });
                setIsLoading(false);
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend verification email'
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Wrong email?{' '}
              <button 
                onClick={() => setIsEmailSent(false)} 
                className="text-primary hover:underline"
              >
                Go back
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10" />
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="flex items-center justify-center mb-6 group">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
          </Link>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Start learning smarter today
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Benefits */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 space-y-2 border border-primary/10">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center text-sm">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  {benefit}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full h-11 shadow-md" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-muted-foreground text-center">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline">Privacy Policy</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
