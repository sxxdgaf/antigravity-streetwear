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
  auth = {
    signIn: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (cb: (event: string, session: any) => void) => {
      // no-op subscription for mock
      const sub = { unsubscribe: () => {} };
      return { data: { subscription: sub }, error: null };
    },
  };
}

export const supabaseClient = HAS_ENV
  ? createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : (new MockClient() as any);

export default supabaseClient;

