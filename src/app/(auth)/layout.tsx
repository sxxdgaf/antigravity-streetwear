import Link from 'next/link';

/**
 * Auth Layout
 * Minimal layout for authentication pages
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col">
      {/* Header with logo */}
      <header className="p-6">
        <Link 
          href="/" 
          className="font-display text-2xl text-brand-white tracking-tight hover:text-brand-grey-300 transition-colors"
        >
          ANTIGRAVITY
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-brand-grey-500 text-sm">
          © {new Date().getFullYear()} ANTIGRAVITY. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
