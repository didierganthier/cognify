import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { VerificationBanner } from '@/components/verification-banner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if email is verified
  const isEmailVerified = user.email_confirmed_at !== null;

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <div className="ml-64">
        <DashboardHeader user={{ email: user.email || '' }} />
        <main className="p-6">
          {!isEmailVerified && <VerificationBanner email={user.email || ''} />}
          {children}
        </main>
      </div>
    </div>
  );
}
