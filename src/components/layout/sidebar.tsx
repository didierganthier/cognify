'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Brain, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  Plus,
  CreditCard,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2 group">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Cognify</span>
        </Link>
        {/* Close button - mobile only */}
        <button
          className="lg:hidden p-2 hover:bg-muted rounded-lg"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* New Upload Button */}
      <div className="p-4">
        <Button className="w-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all" asChild>
          <Link href="/dashboard/upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload PDF
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Card */}
      <div className="p-4">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Get unlimited PDFs and audio features
          </p>
          <Button size="sm" variant="secondary" className="w-full text-xs" asChild>
            <Link href="/dashboard/billing">
              View Plans
            </Link>
          </Button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background border rounded-lg shadow-sm"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 z-50 h-screen w-72 border-r bg-gradient-to-b from-background to-muted/20 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-64 border-r bg-gradient-to-b from-background to-muted/20">
        <SidebarContent />
      </aside>
    </>
  );
}
