// Development client that doesn't require environment variables
export function createClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            limit: async () => ({ data: [], error: null }),
            order: () => ({
              order: () => ({
                limit: async () => ({ data: [], error: null }),
              }),
            }),
          }),
          limit: async () => ({ data: [], error: null }),
          order: () => ({
            order: () => ({
              limit: async () => ({ data: [], error: null }),
            }),
          }),
          single: async () => ({ data: null, error: null }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({ data: null, error: null }),
        }),
      }),
    }),
  };
}
