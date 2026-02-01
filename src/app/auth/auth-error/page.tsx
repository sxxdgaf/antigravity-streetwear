import Link from 'next/link';

export const metadata = {
  title: 'Authentication Error',
};

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="font-display text-3xl text-brand-white mb-4">
          Authentication Error
        </h1>
        <p className="text-brand-grey-400 mb-8">
          There was a problem signing you in. This could be because the link has
          expired or has already been used.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="btn-primary">
            Try Again
          </Link>
          <Link href="/" className="btn-secondary border-brand-white text-brand-white hover:bg-brand-white hover:text-brand-black">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
