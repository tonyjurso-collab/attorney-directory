import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/types/database';

export function createClient() {
  // Use development client if environment variables are not set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const { createClient: createDevClient } = require('./client-dev');
    return createDevClient();
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
