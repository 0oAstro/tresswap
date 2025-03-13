import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Cookie options for better persistence
      cookieOptions: {
        // 30 days expiry time for cookies
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
      
      auth: {
        // Persist sessions across browser sessions/tabs
        persistSession: true,
        
        // Auto-refresh token when it nears expiration
        autoRefreshToken: true,
        
        // Debug auth issues
        debug: process.env.NODE_ENV !== 'production',
      },
    }
  );
}
