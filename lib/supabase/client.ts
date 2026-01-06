import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { useAuth } from '@clerk/nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClerkSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await window.Clerk?.session?.getToken({
          template: 'supabase',
        });

        const headers = new Headers(options.headers);
        headers.set('Authorization', `Bearer ${clerkToken}`);

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });
}

export function useSupabaseClient() {
  const { getToken } = useAuth();

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await getToken({
          template: 'supabase',
        });

        const headers = new Headers(options.headers);
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`);
        }

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });

  return client;
}
