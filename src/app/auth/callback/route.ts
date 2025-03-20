import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // If "redirectTo" is in param, use it as the redirect URL, otherwise default to /swap
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // If there's an error in the request, redirect to login with the error message
  if (error || errorDescription) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set(
      "error",
      errorDescription || error || "Authentication failed"
    );
    return NextResponse.redirect(loginUrl);
  }

  // If no code is provided, redirect to login
  if (!code) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  try {
    const supabase = await createClient();

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    // If there's an error during the code exchange, redirect to login with error message
    if (exchangeError) {
      console.error("Auth callback error:", exchangeError);
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set(
        "error",
        exchangeError.message || "Authentication failed"
      );
      return NextResponse.redirect(loginUrl);
    }

    // Handle different environments
    const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      // Local environment - no load balancer
      return NextResponse.redirect(`${origin}${redirectTo}`);
    } else if (forwardedHost) {
      // Production with load balancer
      return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`);
    } else {
      // Default fallback
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    return NextResponse.redirect(
      new URL("/login?error=Unexpected+authentication+error", origin)
    );
  }
}
