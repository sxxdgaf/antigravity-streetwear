'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { CartIcon } from '@/components/cart';
import { SearchModal } from '@/components/search';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Shop All', href: '/shop' },
  { name: 'New Arrivals', href: '/shop?filter=new' },
  { name: 'Hoodies', href: '/category/hoodies' },
  { name: 'T-Shirts', href: '/category/t-shirts' },
  { name: 'Pants', href: '/category/pants' },
  { name: 'Accessories', href: '/category/accessories' },
  { name: 'Lookbook', href: '/lookbook' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const isHomepage = pathname === '/';
  const headerBg = isHomepage && !isScrolled && !isMenuOpen
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-md shadow-sm';
  const textColor = isHomepage && !isScrolled && !isMenuOpen
    ? 'text-white'
    : 'text-brand-black';

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          headerBg
        )}
      >
        {/* Announcement Bar */}
        <div className="bg-brand-black text-white text-center py-2 text-xs sm:text-sm">
          <span>Free shipping on orders over PKR 10,000 | </span>
          <Link href="/shop" className="underline hover:no-underline">
            Shop Now
          </Link>
        </div>

        <Container>
          <nav className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn('lg:hidden p-2 -ml-2', textColor)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link
              href="/"
              className={cn(
                'font-display text-xl lg:text-2xl font-bold tracking-tight',
                textColor
              )}
            >
              ANTIGRAVITY
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigation.slice(0, 6).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:opacity-70',
                    textColor,
                    pathname === item.href && 'underline underline-offset-4'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn('p-2 transition-colors hover:opacity-70', textColor)}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/wishlist"
                className={cn('p-2 transition-colors hover:opacity-70 hidden sm:block', textColor)}
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              <Link
                href="/account"
                className={cn('p-2 transition-colors hover:opacity-70 hidden sm:block', textColor)}
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>

              <div className={textColor}>
                <CartIcon />
              </div>
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl"
            >
              <div className="pt-24 pb-8 px-6 h-full overflow-y-auto">
                <nav className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'block py-3 text-lg font-medium text-brand-black hover:text-brand-grey-600 transition-colors',
                        pathname === item.href && 'text-brand-accent'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-brand-grey-200 space-y-4">
                  <Link
                    href="/account"
                    className="flex items-center gap-3 py-2 text-brand-grey-600 hover:text-brand-black"
                  >
                    <User className="w-5 h-5" />
                    Account
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-3 py-2 text-brand-grey-600 hover:text-brand-black"
                  >
                    <Heart className="w-5 h-5" />
                    Wishlist
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <Container className="py-6">
                <div className="flex items-center gap-4">
                  <Search className="w-6 h-6 text-brand-grey-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    autoFocus
                    className="flex-1 text-xl outline-none bg-transparent placeholder:text-brand-grey-400"
                  />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 hover:bg-brand-grey-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </Container>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Spacer for fixed header */}
      <div className="h-[calc(2rem+4rem)] lg:h-[calc(2rem+5rem)]" />
    </>
  );
}
