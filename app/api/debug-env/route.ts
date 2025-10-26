import { NextResponse } from 'next/server';

export async function GET() {
  // This runs server-side, so it should have access to all env vars
  
  // Get all environment variables
  const allEnvKeys = Object.keys(process.env);
  
  // Check specific variables that should be working
  const specificVars = {
    // Algolia variables
    NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
    ALGOLIA_ADMIN_API_KEY: process.env.ALGOLIA_ADMIN_API_KEY,
    
    // Supabase variables (should be working since other components work)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // OpenAI variables (for chatbot)
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    
    // Iron Session variables (for chatbot sessions)
    IRON_SESSION_PASSWORD: process.env.IRON_SESSION_PASSWORD,
    
          // Google Places API (for reviews)
          GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
          
          // Google Maps API (for geocoding)
          GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
          GOOGLE_GEOCODING_API_KEY: process.env.GOOGLE_GEOCODING_API_KEY,
    
    // Stripe variables
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    
    // LeadProsper variables
    LEADPROSPER_API_KEY: process.env.LEADPROSPER_API_KEY,
    
    // System variables
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  };

  // Group variables by category
  const categorizedVars = {
    algolia: allEnvKeys.filter(key => key.includes('ALGOLIA')),
    supabase: allEnvKeys.filter(key => key.includes('SUPABASE')),
    openai: allEnvKeys.filter(key => key.includes('OPENAI')),
    iron: allEnvKeys.filter(key => key.includes('IRON')),
    google: allEnvKeys.filter(key => key.includes('GOOGLE')),
    stripe: allEnvKeys.filter(key => key.includes('STRIPE')),
    leadprosper: allEnvKeys.filter(key => key.includes('LEADPROSPER')),
    nextPublic: allEnvKeys.filter(key => key.startsWith('NEXT_PUBLIC_')),
    other: allEnvKeys.filter(key => 
      !key.includes('ALGOLIA') && 
      !key.includes('SUPABASE') && 
      !key.includes('OPENAI') && 
      !key.includes('IRON') && 
      !key.includes('GOOGLE') && 
      !key.includes('STRIPE') && 
      !key.includes('LEADPROSPER') && 
      !key.startsWith('NEXT_PUBLIC_') &&
      !['NODE_ENV', 'PORT', 'PATH', 'NODE_PATH'].includes(key)
    )
  };

  // Check which variables have values vs are undefined
  const varStatus = Object.entries(specificVars).reduce((acc, [key, value]) => {
    acc[key] = value ? 'SET' : 'NOT SET';
    return acc;
  }, {} as Record<string, string>);

  return NextResponse.json({
    message: 'Comprehensive Environment Debug Info',
    timestamp: new Date().toISOString(),
    
    // Specific variable values (masked for security)
    specificVars: Object.entries(specificVars).reduce((acc, [key, value]) => {
      acc[key] = value ? `${value.substring(0, 4)}...` : 'NOT SET';
      return acc;
    }, {} as Record<string, string>),
    
    // Variable status
    varStatus,
    
    // Categorized variable names
    categorizedVars,
    
    // Summary counts
    summary: {
      totalEnvVars: allEnvKeys.length,
      algoliaVars: categorizedVars.algolia.length,
      supabaseVars: categorizedVars.supabase.length,
      nextPublicVars: categorizedVars.nextPublic.length,
      otherVars: categorizedVars.other.length,
    },
    
    // System info
    systemInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
    },
    
    // All environment variable names (for debugging)
    allEnvVarNames: allEnvKeys.sort(),
  });
}
