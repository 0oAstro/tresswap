"use client";

import { loginWithTwitter, loginWithGoogle } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

// Component specifically for handling search params
function RedirectHandler({
  onRedirectFound,
}: {
  onRedirectFound: (redirectTo: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  useEffect(() => {
    onRedirectFound(redirectTo);
  }, [redirectTo, onRedirectFound]);

  return null;
}

export function LoginForm({
  className,
  initialError,
  ...props
}: React.ComponentProps<"div"> & { initialError?: string | null }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialError || null
  );
  const [isPending, startTransition] = useTransition();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  // Handle initialError if provided from URL parameters
  useEffect(() => {
    if (initialError) {
      setErrorMessage(initialError);
    }
  }, [initialError]);

  const handleTwitterLogin = async () => {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await loginWithTwitter(redirectTo);

      if (result?.error) {
        setErrorMessage(result.error);
        toast.error("Twitter login failed", {
          description: result.error,
        });
      }
    });
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await loginWithGoogle(redirectTo);

      if (result?.error) {
        setErrorMessage(result.error);
        toast.error("Google login failed", {
          description: result.error,
        });
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Search params handler component */}
      <RedirectHandler onRedirectFound={setRedirectTo} />

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Image
            src="/android-chrome-192x192.png"
            alt="tresswap logo by montrox"
            width={80}
            height={80}
          />
          <h1 className="text-xl font-bold">tresswap</h1>
        </div>
        <p className="text-sm text-muted-foreground">swap the tresses</p>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 mt-6">
        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={handleTwitterLogin}
          disabled={isPending}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4 mr-2"
          >
            <path
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              fill="currentColor"
            />
          </svg>
          continue with X
        </Button>

        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isPending}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            className="h-4 w-4 mr-2"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          continue with Google
        </Button>
      </div>

      <div className="text-muted-foreground text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        credits to{" "}
        <Button
          variant="link"
          onClick={() =>
            (window.location.href = "https://reddit.com/u/Montrox")
          }
          className="text-cyan-400 hover:text-cyan-300 transition-colors p-0 h-auto"
        >
          montrox
        </Button>
        &nbsp;for the pixelated girl logo.
      </div>
    </div>
  );
}
