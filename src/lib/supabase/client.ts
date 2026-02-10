/**
 * Safe Supabase client for browser usage.
 * If environment variables are missing, exports a mock client to prevent runtime crashes.
 */
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const HAS_ENV = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

class MockClient {
  from() {
    return {
      select: () => ({ then: (resolve: any) => resolve({ data: [], error: null }) }),
      insert: () => ({ then: (resolve: any) => resolve({ data: [], error: null }) }),
      update: () => ({ then: (resolve: any) => resolve({ data: [], error: null }) }),
      delete: () => ({ then: (resolve: any) => resolve({ data: [], error: null }) }),
    };
  }
  auth = { signIn: async () => ({ data: null, error: null }), signOut: async () => ({ error: null }) };
}

export const supabaseClient = HAS_ENV
  ? createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : (new MockClient() as any);

export default supabaseClient;
/**
 * Supabase Client Configuration
 * Browser client for client-side operations
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Create a Supabase client for browser/client-side usage
 * This client uses the anon key and respects RLS policies
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton instance for client-side usage
let browserClient: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
