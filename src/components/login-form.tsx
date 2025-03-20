"use client";

import { login, signup, loginWithTwitter } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [isSignUp, setIsSignUp] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [formTouched, setFormTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialError || null
  );
  const [isPending, startTransition] = useTransition();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  // Check if passwords match whenever either password field changes
  useEffect(() => {
    if (isSignUp && formTouched) {
      setPasswordsMatch(confirmPassword === "" || password === confirmPassword);
    }
  }, [password, confirmPassword, isSignUp, formTouched]);

  // Handle initialError if provided from URL parameters
  useEffect(() => {
    if (initialError) {
      setErrorMessage(initialError);
    }
  }, [initialError]);

  // Reset form state when switching between login and signup
  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
    setPasswordsMatch(true);
    setFormTouched(false);
    setErrorMessage(null);
  }, [isSignUp]);

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setFormTouched(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (confirmPassword !== "") {
      setFormTouched(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await (isSignUp ? signup(formData) : login(formData));

      if (result?.error) {
        setErrorMessage(result.error);
        toast.error(isSignUp ? "Sign up failed" : "Login failed", {
          description: result.error,
        });
      }
    });
  };

  const handleTwitterLogin = async () => {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await loginWithTwitter();
      console.log(result);

      if (result?.error) {
        setErrorMessage(result.error);
        toast.error("Twitter login failed", {
          description: result.error,
        });
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Search params handler component */}
      <RedirectHandler onRedirectFound={setRedirectTo} />

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
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
            <div className="text-center text-sm">
              {isSignUp ? "already swapped? " : "first time swapping? "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="underline underline-offset-4"
              >
                {isSignUp ? "log in" : "sign up :)"}
              </button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-6 mt-4">
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="astro@gmail.com"
              required
              className="focus:ring-2 focus:ring-opacity-50 focus:ring-cyan-500"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              className={cn(
                "focus:ring-2 focus:ring-opacity-50",
                isSignUp && !passwordsMatch
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-cyan-500"
              )}
            />
          </div>
          {isSignUp && (
            <div className="grid gap-3">
              <Label
                htmlFor="confirmPassword"
                className="flex items-center justify-between"
              >
                <span>Confirm Password</span>
                {formTouched && (
                  <span
                    className={`text-xs ${
                      passwordsMatch ? "text-cyan-400" : "text-red-400"
                    }`}
                  >
                    {passwordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </span>
                )}
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmChange}
                required
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  formTouched && confirmPassword !== "" && passwordsMatch
                    ? "border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
                    : formTouched && !passwordsMatch
                    ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    : "focus:ring-2 focus:ring-opacity-50 focus:ring-cyan-500"
                )}
              />
            </div>
          )}
          {/* Hidden input to pass the redirectTo value */}
          {redirectTo && (
            <Input type="hidden" name="redirectTo" value={redirectTo} />
          )}
          <Button
            type="submit"
            className={cn(
              "w-full",
              (isSignUp && !passwordsMatch) || isPending
                ? "opacity-50 cursor-not-allowed"
                : ""
            )}
            disabled={(isSignUp && !passwordsMatch) || isPending}
          >
            {isPending ? "Processing..." : isSignUp ? "sign up :)" : "login"}
          </Button>
        </div>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t mt-6">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            or
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-1 mt-6">
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
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
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
