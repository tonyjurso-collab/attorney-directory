import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/types/database';

export function createClient() {
  // Temporarily hardcode credentials for testing
  const supabaseUrl = 'https://ydfmkyfbbubkragiijla.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZm1reWZiYnVia3JhZ2lpamxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjk5OTMsImV4cCI6MjA3NjkwNTk5M30.e-RWCOoY6oc7aTsZVhwZoXRZmL3kaBQEAx2XhUFf06c';

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
