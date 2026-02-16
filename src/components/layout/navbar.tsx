'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Cognify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-muted-foreground hover:text-primary transition font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-primary transition font-medium">
              Pricing
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition font-medium">
              How it Works
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="shadow-md shadow-primary/25">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link 
              href="#features" 
              className="block text-muted-foreground hover:text-foreground transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              className="block text-muted-foreground hover:text-foreground transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="#how-it-works" 
              className="block text-muted-foreground hover:text-foreground transition"
              onClick={() => setIsMenuOpen(false)}
            >
              How it Works
            </Link>
            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
