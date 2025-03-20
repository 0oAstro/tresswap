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

// Validation functions for server-side checking
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
  // At least 8 characters, must contain both letters and digits
  const hasMinLength = password.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasDigits = /\d/.test(password);

  return hasMinLength && hasLetters && hasDigits;
};

// Sanitize input to prevent injection attacks
const sanitizeInput = (input: string): string => {
  // Basic sanitization - for production, consider using a dedicated library
  return input.replace(/[^\w@.-]/gi, "");
};

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Get the redirectTo URL if provided
  const redirectTo = (formData.get("redirectTo") as string) || "/";

  // Get and validate inputs
  const email = sanitizeInput(formData.get("email") as string);
  const password = formData.get("password") as string;

  // Server-side validation
  if (!email || !isValidEmail(email)) {
    return {
      error: "Please enter a valid email address",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Return the error instead of redirecting
    return {
      error: error.message || "Failed to sign in. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Get the redirectTo URL if provided
  const redirectTo = (formData.get("redirectTo") as string) || "/swap";

  // Get and validate inputs
  const email = sanitizeInput(formData.get("email") as string);
  const password = formData.get("password") as string;

  // Server-side validation
  if (!email || !isValidEmail(email)) {
    return {
      error: "Please enter a valid email address",
    };
  }

  if (!password || !isValidPassword(password)) {
    return {
      error:
        "Password must be at least 8 characters long and contain both letters and numbers",
    };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    // Return the error instead of redirecting
    return {
      error: error.message || "Failed to sign up. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function loginWithTwitter() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitter",
    options: { redirectTo: getURL() },
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
