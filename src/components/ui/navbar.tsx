"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/lib/auth";
import { toast } from "sonner";

const routes = [
  {
    href: "/",
    label: "home",
  },
  {
    href: "/swap",
    label: "try a style",
  },
  {
    href: "/history",
    label: "history",
  },
  {
    href: "/contact",
    label: "contact",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prevent redirection to login if already logged in
  useEffect(() => {
    if (pathname === "/login") {
      checkAuthAndRedirect();
    }
  }, [pathname]);

  // Check authentication and redirect if needed
  const checkAuthAndRedirect = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session && pathname === "/login") {
      router.replace("/swap");
    }

    setIsLoggedIn(!!session);
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuth();

    // Set up auth state change listener
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session);
      setIsLoggedIn(!!session);

      // If user has logged out, stop loading state
      if (event === "SIGNED_OUT") {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();

      // Force a refresh of the auth state just in case
      const supabase = createClient();
      await supabase.auth.signOut();

      // Clear any local storage or session data
      localStorage.removeItem("supabase.auth.token");

      // After logout, redirect to home
      router.push("/");

      // Update isLoggedIn state manually
      setIsLoggedIn(false);

      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out", {
        description: "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 w-full border-b">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">tresswap</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-3">
          {routes.map((route) => {
            const isActive = pathname === route.href;

            return (
              <Button
                key={route.href}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={route.href}>{route.label}</Link>
              </Button>
            );
          })}

          {isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {loading ? "signing out..." : "sign out"}
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">login</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] md:hidden">
            <nav className="flex flex-col gap-2 mt-8">
              {routes.map((route) => {
                const isActive = pathname === route.href;

                return (
                  <SheetClose asChild key={route.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      asChild
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href={route.href}>{route.label}</Link>
                    </Button>
                  </SheetClose>
                );
              })}

              <SheetClose asChild>
                {isLoggedIn ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={loading}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {loading ? "signing out..." : "sign out"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href="/login">login</Link>
                  </Button>
                )}
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
