import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-10 w-10 text-primary" />
          </Link>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Verification Failed</CardTitle>
          <CardDescription>
            We couldn&apos;t verify your email. The link may have expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>This can happen if:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The verification link has expired</li>
              <li>You&apos;ve already verified your email</li>
              <li>The link was copied incorrectly</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="w-full">
              <Button className="w-full">Try signing in</Button>
            </Link>
            <Link href="/signup" className="w-full">
              <Button variant="outline" className="w-full">Sign up again</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
