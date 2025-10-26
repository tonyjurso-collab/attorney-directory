import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/types/database';

export async function createClient() {
  // Use hardcoded values for testing since env vars aren't loading
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ydfmkyfbbubkragiijla.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZm1reWZiYnVia3JhZ2lpamxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjk5OTMsImV4cCI6MjA3NjkwNTk5M30.e-RWCOoY6oc7aTsZVhwZoXRZmL3kaBQEAx2XhUFf06c';
  
  // Use development client if environment variables are not set
  if (!supabaseUrl || !supabaseKey) {
    const { createClient: createDevClient } = require('./client-dev');
    return createDevClient();
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
