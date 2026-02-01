'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const accountNav = [
  { name: 'Profile', href: '/account', icon: User },
  { name: 'Orders', href: '/account/orders', icon: Package },
  { name: 'Addresses', href: '/account/addresses', icon: MapPin },
  { name: 'Wishlist', href: '/wishlist', icon: Heart },
  { name: 'Settings', href: '/account/settings', icon: Settings },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentPage = accountNav.find((item) => item.href === pathname);

  return (
    <Container className="py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-between w-full p-4 bg-brand-grey-50 rounded-lg"
          >
            <span className="flex items-center gap-3 font-medium">
              {currentPage && <currentPage.icon className="w-5 h-5" />}
              {currentPage?.name || 'Account'}
            </span>
            <ChevronRight 
              className={cn(
                'w-5 h-5 transition-transform',
                isMobileMenuOpen && 'rotate-90'
              )} 
            />
          </button>

          {isMobileMenuOpen && (
            <nav className="mt-2 p-2 bg-brand-grey-50 rounded-lg space-y-1">
              {accountNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-brand-black text-white'
                      : 'text-brand-grey-600 hover:bg-brand-grey-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <hr className="my-2 border-brand-grey-200" />
              <button
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </nav>
          )}
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="text-lg font-display font-bold text-brand-black mb-6">
              My Account
            </h2>
            <nav className="space-y-1">
              {accountNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-brand-black text-white'
                      : 'text-brand-grey-600 hover:bg-brand-grey-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            <hr className="my-6 border-brand-grey-200" />

            <button
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </Container>
  );
}
