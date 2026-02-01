import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Adjust this value in production
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out certain errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Ignore certain server errors
    if (error instanceof Error) {
      // Ignore expected errors
      if (error.message.includes('NEXT_NOT_FOUND')) {
        return null;
      }

      if (error.message.includes('NEXT_REDIRECT')) {
        return null;
      }
    }

    return event;
  },
});
