"use client";

import { LoginForm } from "@/components/login-form";
import { useSearchParams } from "next/navigation";

export default function ErrorMessageComponent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return <LoginForm initialError={error} />;
}
