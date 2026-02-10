/**
 * Supabase Server Client Configuration
 * For Server Components, Server Actions, and Route Handlers
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// Provide a safe mock Supabase client when environment variables are not set.
class MockQuery {
  _single = false;
  _result: any = { data: [], error: null };
  select() {
    return this;
  }
  eq() {
    return this;
  }
  order() {
    return this;
  }
  limit() {
    return this;
  }
  insert(payload?: any) {
    this._result = { data: Array.isArray(payload) ? payload : [payload], error: null };
    return this;
  }
  update(payload?: any) {
    this._result = { data: [payload], error: null };
    return this;
  }
  delete() {
    this._result = { data: [], error: null };
    return this;
  }
  single() {
    this._single = true;
    return this;
  }
  then(resolve: any) {
    const res = this._single ? { data: null, error: null } : this._result;
    resolve(res);
    return { catch() { } };
  }
}

class MockSupabaseClient {
  from() {
    return new MockQuery();
  }
  // minimal auth stub
  auth = { getSession: async () => ({ data: { session: null }, error: null }) };
}

const HAS_ENV = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Create a Supabase client for server-side operations
 * Uses cookies for session management. If environment variables are not
 * configured, returns a safe mock client to avoid build/runtime failures.
 */
export async function createClient() {
  if (!HAS_ENV) {
    return new MockSupabaseClient() as any;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignore in read-only contexts
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignore in read-only contexts
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase admin client with service role key
 * Returns a mock client when service role key is not configured.
 */
export function createAdminClient() {
  if (!HAS_ENV || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new MockSupabaseClient() as any;
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {},
        remove() {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
