"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Get the redirectTo URL if provided
  const redirectTo = (formData.get("redirectTo") as string) || "/swap";

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

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

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

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
    options: {
      redirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback`,
    },
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
