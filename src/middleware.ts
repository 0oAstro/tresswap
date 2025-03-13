import { type NextRequest, NextResponse } from "next/server";
import { updateSession, createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Update the session first
  const response = await updateSession(request);
  
  // Protected routes that require authentication
  const protectedRoutes = ['/history', '/swap'];
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    try {
      // Create a client to check authentication status
      const supabase = createClient(request);
      
      // Get the user from the session
      const { data: { user } } = await supabase.auth.getUser();
      
      // If there's no user, redirect to login
      if (!user) {
        const url = new URL('/login', request.url);
        url.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Auth error in middleware:', error);
      // On error, redirect to login with error message
      const url = new URL('/login', request.url);
      url.searchParams.set('redirectTo', pathname);
      url.searchParams.set('error', 'Authentication failed. Please log in again.');
      return NextResponse.redirect(url);
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
