"use client";

import { LoginForm } from "@/components/login-form";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");

  // Show toast for error messages
  useEffect(() => {
    if (errorMessage) {
      toast.error("Authentication Error", {
        description: errorMessage
      });
    }
  }, [errorMessage]);

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm initialError={errorMessage} />
      </div>
    </div>
  );
}
