import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";
import ErrorMessage from "./error-message";

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<LoginForm />}>
          <ErrorMessage />
        </Suspense>
      </div>
    </div>
  );
}
