import { Suspense } from "react";
import ErrorMessageComponent from "./error-message";

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <ErrorMessageComponent />
        </Suspense>
      </div>
    </div>
  );
}
