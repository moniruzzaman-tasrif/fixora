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
    await authClient.signOut();
    router.replace("/");
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
      <div className="flex items-center gap-3">
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

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-teal-700 transition-colors font-medium"
          >
            <Home className="size-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900 capitalize">
            {user.role} Dashboard
          </span>
        </div>
      </div>

      {/* Right: User Card & Sign Out */}
      <div className="flex items-center gap-3">

        {/* User Card & Role Badge */}
        <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
              {user.name}
            </span>
            <Badge
              variant="outline"
              className={`text-[9px] self-end font-semibold px-1.5 py-0 mt-0.5 ${roleBadge.className}`}
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
