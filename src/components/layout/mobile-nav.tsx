"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menu,
  Wrench,
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { User, UserRole } from "@/types";
import { PUBLIC_NAV_ITEMS, ROLE_DASHBOARD_ROUTES, ROLE_BADGE_VARIANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  user: User | null;
  onSignOut?: () => void;
  onRoleSwitch?: (role: UserRole) => void;
  onToggleLogin?: () => void;
}

export function MobileNav({
  user,
  onSignOut,
  onRoleSwitch,
  onToggleLogin,
}: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  const closeSheet = () => setOpen(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FX";

  const dashboardHref = user ? ROLE_DASHBOARD_ROUTES[user.role] : "/dashboard/customer";
  const roleBadge = user ? ROLE_BADGE_VARIANTS[user.role] : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Open mobile navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0 flex flex-col justify-between bg-white">
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <SheetHeader className="p-5 border-b border-slate-100">
            <SheetTitle className="text-left">
              <Logo showTagline size="sm" />
            </SheetTitle>
          </SheetHeader>

          {/* User Profile Card if logged in */}
          {user ? (
            <div className="p-4 mx-4 mt-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <Avatar className="size-11 ring-2 ring-teal-600/20">
                  {user.image && <AvatarImage src={user.image} alt={user.name} />}
                  <AvatarFallback className="bg-teal-100 text-teal-800 font-bold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {user.name}
                    </p>
                    {roleBadge && (
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] shrink-0 font-medium", roleBadge.className)}
                      >
                        {roleBadge.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* Role Switcher in Demo Mode */}
              {onRoleSwitch && (
                <div className="mt-3 pt-2.5 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Preview Role
                    </span>
                    {onToggleLogin && (
                      <button
                        type="button"
                        onClick={onToggleLogin}
                        className="text-[10px] text-teal-700 font-medium hover:underline"
                      >
                        Sign Out Demo
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(["customer", "technician", "admin"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => onRoleSwitch(r)}
                        className={`text-xs py-1 px-1 rounded text-center capitalize font-medium transition-colors ${
                          user.role === r
                            ? "bg-teal-700 text-white"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {r.slice(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 mx-4 mt-4 rounded-xl bg-teal-50/70 border border-teal-100">
              <p className="text-xs text-teal-900 font-medium mb-3">
                Sign in to book repair services or manage your technician profile.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-teal-200 text-teal-800 hover:bg-teal-100"
                  onClick={() => {
                    closeSheet();
                    window.location.href = "/sign-in";
                  }}
                >
                  <LogIn className="size-3.5 mr-1" />
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white"
                  onClick={() => {
                    closeSheet();
                    window.location.href = "/sign-up";
                  }}
                >
                  <UserPlus className="size-3.5 mr-1" />
                  Sign Up
                </Button>
              </div>
              {onToggleLogin && (
                <button
                  type="button"
                  onClick={onToggleLogin}
                  className="mt-2 text-[11px] text-teal-700 hover:underline block text-center w-full"
                >
                  (Or click to activate Demo Login)
                </button>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <div className="px-4 py-4 space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Navigation
            </p>
            {PUBLIC_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSheet}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-800 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <span>{item.title}</span>
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-teal-600" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Logged in Dashboard Section */}
          {user && (
            <div className="px-4 py-2 space-y-1 border-t border-slate-100">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Dashboard & Services
              </p>

              <Link
                href={dashboardHref}
                onClick={closeSheet}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === dashboardHref
                    ? "bg-teal-50 text-teal-800 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <LayoutDashboard className="size-4 text-teal-700" />
                <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard</span>
              </Link>

              {user.role === "customer" && (
                <>
                  <Link
                    href="/dashboard/customer/bookings"
                    onClick={closeSheet}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <CalendarCheck className="size-4 text-slate-500" />
                    <span>My Bookings</span>
                  </Link>
                  <Link
                    href="/dashboard/customer/payments"
                    onClick={closeSheet}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <CreditCard className="size-4 text-slate-500" />
                    <span>Payment History</span>
                  </Link>
                </>
              )}

              {user.role === "technician" && (
                <>
                  <Link
                    href="/dashboard/technician/my-services"
                    onClick={closeSheet}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <Wrench className="size-4 text-slate-500" />
                    <span>My Services</span>
                  </Link>
                  <Link
                    href="/dashboard/technician/requests"
                    onClick={closeSheet}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <CalendarCheck className="size-4 text-slate-500" />
                    <span>Job Requests</span>
                  </Link>
                </>
              )}

              {user.role === "admin" && (
                <>
                  <Link
                    href="/dashboard/admin/services"
                    onClick={closeSheet}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <ShieldCheck className="size-4 text-slate-500" />
                    <span>Service Approval</span>
                  </Link>
                  <Link
                    href="/dashboard/admin/users"
                    onClick={closeSheet}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <Users className="size-4 text-slate-500" />
                    <span>User Management</span>
                  </Link>
                </>
              )}

              <Link
                href="/dashboard/profile"
                onClick={closeSheet}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <UserIcon className="size-4 text-slate-500" />
                <span>Update Profile</span>
              </Link>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {user && (
          <div className="p-4 border-t border-slate-100">
            <Button
              variant="outline"
              className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 justify-center gap-2"
              onClick={() => {
                closeSheet();
                if (onSignOut) onSignOut();
              }}
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
