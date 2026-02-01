import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Instagram, Twitter, Facebook, Youtube, Mail } from 'lucide-react';

const footerLinks = {
  shop: {
    title: 'Shop',
    links: [
      { name: 'New Arrivals', href: '/shop?filter=new' },
      { name: 'Best Sellers', href: '/shop?filter=best-sellers' },
      { name: 'Hoodies', href: '/category/hoodies' },
      { name: 'T-Shirts', href: '/category/t-shirts' },
      { name: 'Pants', href: '/category/pants' },
      { name: 'Accessories', href: '/category/accessories' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Lookbook', href: '/lookbook' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Shipping & Returns', href: '/shipping' },
      { name: 'Size Guide', href: '/size-guide' },
      { name: 'Track Order', href: '/track-order' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Refund Policy', href: '/refunds' },
    ],
  },
};

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/antigravity', icon: Instagram },
  { name: 'Twitter', href: 'https://twitter.com/antigravity', icon: Twitter },
  { name: 'Facebook', href: 'https://facebook.com/antigravity', icon: Facebook },
  { name: 'YouTube', href: 'https://youtube.com/antigravity', icon: Youtube },
];

export function Footer() {
  return (
    <footer className="bg-brand-black text-white">
      {/* Newsletter Section */}
      <div className="border-b border-brand-grey-800">
        <Container className="py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl font-display font-bold mb-3">Join the Movement</h3>
            <p className="text-brand-grey-400 mb-6">
              Subscribe to get early access to new drops, exclusive offers, and 10% off your first order.
            </p>
            <form className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey-500" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-12 pl-12 pr-4 bg-brand-grey-900 border border-brand-grey-700 rounded-lg text-white placeholder:text-brand-grey-500 focus:outline-none focus:border-brand-grey-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-8 bg-white text-brand-black font-medium rounded-lg hover:bg-brand-grey-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </Container>
      </div>

      {/* Links Section */}
      <Container className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <Link href="/" className="font-display text-2xl font-bold tracking-tight">
              ANTIGRAVITY
            </Link>
            <p className="mt-4 text-sm text-brand-grey-400 max-w-xs">
              Premium streetwear that defies convention. Crafted for those who dare to stand out.
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-brand-grey-900 rounded-full flex items-center justify-center text-brand-grey-400 hover:bg-brand-grey-800 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-grey-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-brand-grey-800">
        <Container className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-brand-grey-500">
              © {new Date().getFullYear()} ANTIGRAVITY. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <img src="/images/payment/visa.svg" alt="Visa" className="h-6 opacity-60" />
              <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-6 opacity-60" />
              <img src="/images/payment/amex.svg" alt="American Express" className="h-6 opacity-60" />
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
