'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Bell, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

interface DashboardHeaderProps {
  user: {
    email: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const initials = user.email
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 pl-14 lg:pl-6">
      <div>
        {/* Empty - welcome moved to page */}
      </div>

      <div className="flex items-center space-x-2">
        <Link href="/dashboard/notifications">
          <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
            <Bell className="h-5 w-5" />
            {/* Notification dot */}
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Account</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
