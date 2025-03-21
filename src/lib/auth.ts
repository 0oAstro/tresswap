"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

// Get the site URL from environment variables
const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.startsWith("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
};

export async function loginWithTwitter(redirectPath?: string | null) {
  const supabase = await createClient();

  // Build redirectTo URL that will return to the specified path after auth
  const baseUrl = getURL();
  const finalRedirectUrl = redirectPath
    ? `${baseUrl}?redirectTo=${redirectPath}`
    : baseUrl;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitter",
    options: { redirectTo: finalRedirectUrl },
  });

  if (error) {
    return {
      error:
        error.message || "Failed to sign in with Twitter. Please try again.",
    };
  }

  if (data?.url) {
    redirect(data.url);
  }

  return {
    error: "Failed to get authorization URL from Twitter.",
  };
}

export async function loginWithGoogle(redirectPath?: string | null) {
  const supabase = await createClient();

  // Build redirectTo URL that will return to the specified path after auth
  const baseUrl = getURL();
  const finalRedirectUrl = redirectPath
    ? `${baseUrl}?redirectTo=${redirectPath}`
    : baseUrl;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: finalRedirectUrl },
  });

  if (error) {
    return {
      error:
        error.message || "Failed to sign in with Google. Please try again.",
    };
  }

  if (data?.url) {
    redirect(data.url);
  }

  return {
    error: "Failed to get authorization URL from Google.",
  };
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      error: error.message || "Failed to sign out. Please try again.",
    };
  }

  revalidatePath("/", "layout");

  // Return a success response instead of redirecting
  // This allows the client to decide whether to redirect
  return {
    success: true,
  };
}
