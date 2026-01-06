import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function createClerkSupabaseClientServer() {
  const { getToken } = await auth();

  const clerkToken = await getToken({
    template: 'supabase',
  });

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });

  return supabase;
}

export function createServiceSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}
