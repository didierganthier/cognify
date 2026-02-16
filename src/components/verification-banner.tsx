'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, X, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface VerificationBannerProps {
  email: string;
}

export function VerificationBanner({ email }: VerificationBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResent, setIsResent] = useState(false);
  const supabase = createClient();

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.resend({
        type: 'signup',
        email,
      });
      setIsResent(true);
      setTimeout(() => setIsResent(false), 5000);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDismissed) return null;

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
      <Mail className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span className="text-amber-800 dark:text-amber-200">
          Please verify your email to unlock all features.
        </span>
        <div className="flex items-center gap-2">
          {isResent ? (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Email sent!
            </span>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResend}
              disabled={isLoading}
              className="border-amber-300 hover:bg-amber-100 text-amber-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend email'
              )}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsDismissed(true)}
            className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
