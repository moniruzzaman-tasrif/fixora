"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { ROLE_BADGE_VARIANTS } from "@/lib/constants";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Menu,
  Home,
  LogOut,
} from "lucide-react";

interface DashboardTopbarProps {
  user: User;
  onToggleSidebar: () => void;
}

export function DashboardTopbar({
  user,
  onToggleSidebar,
}: DashboardTopbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(error.message || "Could not sign out. Please try again.");
        return;
      }

      toast.success("You have been signed out.");
      router.replace("/");
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not sign out. Please try again."
      );
    }
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FX";

  const roleBadge = ROLE_BADGE_VARIANTS[user.role];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumb Info */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden text-slate-600 hover:text-slate-900"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="size-5" />
        </Button>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 sm:text-xs">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-teal-700 transition-colors font-medium"
            aria-label="Return to Fixora home"
          >
            <Home className="size-3.5" />
            <span>Home</span>
          </Link>
          <span className="hidden sm:inline">/</span>
          <span className="hidden font-semibold text-slate-900 capitalize sm:inline">
            {user.role} Dashboard
          </span>
        </div>
      </div>

      {/* Right: User Card & Sign Out */}
      <div className="flex items-center gap-3">

        {/* User Card & Role Badge */}
        <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200">
          <div className="flex max-w-[112px] flex-col text-right sm:max-w-[130px]">
            <span className="truncate text-[11px] font-bold text-slate-900 sm:text-xs">
              {user.name}
            </span>
            <Badge
              variant="outline"
              className={`mt-0.5 self-end px-1.5 py-0 text-[8px] font-semibold sm:text-[9px] ${roleBadge.className}`}
            >
              {roleBadge.label}
            </Badge>
          </div>

          <Link href="/dashboard/profile" aria-label="Go to profile">
            <Avatar className="size-9 ring-2 ring-teal-600/20 hover:ring-teal-600 transition-all">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback className="bg-teal-100 text-teal-800 font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSignOut}
            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
