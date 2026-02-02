import { z } from 'zod';

/**
 * Environment variable schema validation
 * This ensures all required environment variables are set
 */

const serverEnvSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  // Optional
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

/**
 * Server-side environment variables
 * These are validated at build time
 */
export const serverEnv = () => {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      '❌ Invalid server environment variables:',
      parsed.error.flatten().fieldErrors
    );

    // Don't throw in development to allow gradual setup
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid server environment variables');
    }
  }

  return parsed.data ?? (process.env as unknown as z.infer<typeof serverEnvSchema>);
};

/**
 * Client-side environment variables
 * Only NEXT_PUBLIC_ prefixed variables are exposed
 */
export const clientEnv = () => {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  });

  if (!parsed.success) {
    console.error(
      '❌ Invalid client environment variables:',
      parsed.error.flatten().fieldErrors
    );

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid client environment variables');
    }
  }

  return parsed.data ?? ({} as z.infer<typeof clientEnvSchema>);
};

// Type exports
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
