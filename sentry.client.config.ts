import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Adjust this value in production
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Replay configuration
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // Integration configuration
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out certain errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Ignore certain errors
    if (error instanceof Error) {
      // Ignore network errors
      if (error.message.includes('Failed to fetch')) {
        return null;
      }

      // Ignore cancelled requests
      if (error.message.includes('AbortError')) {
        return null;
      }

      // Ignore hydration errors in development
      if (
        process.env.NODE_ENV !== 'production' &&
        error.message.includes('Hydration')
      ) {
        return null;
      }
    }

    return event;
  },

  // Filter out certain transactions
  beforeSendTransaction(event) {
    // Filter out health check transactions
    if (event.transaction?.includes('/api/health')) {
      return null;
    }

    return event;
  },
});
