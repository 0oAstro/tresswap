import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // These are paths that require authentication
  const protectedPaths = ["/history"];

  // Paths that allow one free use for non-logged in users
  const oneTimePaths = ["/swap"];

  // Get the user from the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if the current path is a protected path
  const isProtectedPath = protectedPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(path + "/")
  );

  // Check if the current path is a one-time path
  const isOneTimePath = oneTimePaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(path + "/")
  );

  // No user and trying to access a fully protected route
  if (!user && isProtectedPath) {
    // Redirect to login with the intended destination
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Handle one-time paths for non-logged users
  if (!user && isOneTimePath) {
    // Check if user already used their free swap
    const hasUsedFreeSwap = request.cookies.has("used_free_swap");

    if (hasUsedFreeSwap) {
      // Redirect to login with the intended destination
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", request.nextUrl.pathname);
      url.searchParams.set("message", "Sign in to continue using tresswap!");
      return NextResponse.redirect(url);
    }

    // First time user can proceed with their free swap
    return supabaseResponse;
  }

  return supabaseResponse;
}

// Export createClient to use in middleware.ts if needed
export function createClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // This is a read-only client
        },
      },
    }
  );
}
