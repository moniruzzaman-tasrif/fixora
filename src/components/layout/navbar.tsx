"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { UserNav } from "@/components/layout/user-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { PUBLIC_NAV_ITEMS, ROLE_DASHBOARD_ROUTES } from "@/lib/constants";
import { User } from "@/types";
import { cn } from "@/lib/utils";
import { LogIn, UserPlus } from "lucide-react";

interface NavbarProps {
  initialUser?: User | null;
}

export function Navbar({ initialUser = null }: NavbarProps) {
  const pathname = usePathname();

  // In production, session state binds to BetterAuth client:
  // const { data: session } = authClient.useSession();
  const [currentUser, setCurrentUser] = React.useState<User | null>(initialUser);

  const handleSignOut = () => {
    // TODO(owner): replace with authClient.signOut()
    setCurrentUser(null);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 transition-shadow">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Logo showTagline={false} size="default" />

          {/* Center-left: Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2"
            aria-label="Main Navigation"
          >
            {PUBLIC_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3.5 py-1.5 text-sm font-medium rounded-md transition-all duration-150",
                    isActive
                      ? "text-teal-800 bg-teal-50/80 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {item.title}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-teal-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: Action Controls & User Nav */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {currentUser ? (
            /* Logged-in State: Dashboard Link + User Dropdown */
            <div className="flex items-center gap-3">
              <Link
                href={ROLE_DASHBOARD_ROUTES[currentUser.role]}
                className="hidden sm:inline-flex"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-200 bg-teal-50/50 text-teal-800 hover:bg-teal-100/80 hover:text-teal-900 font-medium h-9"
                >
                  Dashboard
                </Button>
              </Link>

              <UserNav user={currentUser} onSignOut={handleSignOut} />
            </div>
          ) : (
            /* Logged-out State: Sign In and Sign Up buttons (strict requirement from AGENTS.md) */
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium h-9 px-3 sm:px-3.5"
                >
                  <LogIn className="size-3.5 mr-1.5 hidden sm:inline" />
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="sm"
                  className="bg-teal-700 hover:bg-teal-800 text-white shadow-xs font-medium h-9 px-3.5 sm:px-4"
                >
                  <UserPlus className="size-3.5 mr-1.5 hidden sm:inline" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Navigation Trigger (< md) */}
          <MobileNav user={currentUser} onSignOut={handleSignOut} />
        </div>
      </div>
    </header>
  );
}
