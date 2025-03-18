"use client";

import { LoginForm } from "@/components/login-form";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";

export function ErrorMessageComponent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");

  // Show toast for error messages
  useEffect(() => {
    if (errorMessage) {
      toast.error("Authentication Error", {
        description: errorMessage,
      });
    }
  }, [errorMessage]);

  return (
    <Suspense fallback={<div>Loading login form...</div>}>
      <LoginForm initialError={errorMessage} />
    </Suspense>
  );
}

export default ErrorMessageComponent;
