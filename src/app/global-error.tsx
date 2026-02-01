'use client';

import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-brand-white">
          <div className="text-center space-y-6 p-8">
            <h1 className="text-4xl font-bold text-brand-black">
              Something went wrong!
            </h1>
            <p className="text-brand-grey-500 max-w-md">
              We apologize for the inconvenience. Our team has been notified and
              is working to fix the issue.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-brand-black text-white rounded-lg hover:bg-brand-grey-800 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="px-6 py-3 border border-brand-black rounded-lg hover:bg-brand-grey-100 transition-colors"
              >
                Go Home
              </a>
            </div>
            {error.digest && (
              <p className="text-xs text-brand-grey-400">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
