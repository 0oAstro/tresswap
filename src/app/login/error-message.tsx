"use client";

import { LoginForm } from "@/components/login-form";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

// Component that uses search params
function ErrorMessageWithParams() {
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

  return <LoginForm initialError={errorMessage} />;
}

// Wrapper component that doesn't use search params
export function ErrorMessageComponent() {
  return <ErrorMessageWithParams />;
}

export default ErrorMessageComponent;
