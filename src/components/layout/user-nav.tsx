"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  CalendarCheck,
  CreditCard,
  Wrench,
  Users,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { User, UserRole } from "@/types";
import { ROLE_DASHBOARD_ROUTES, ROLE_LABELS, ROLE_BADGE_VARIANTS } from "@/lib/constants";

interface UserNavProps {
  user: User;
  onSignOut?: () => void;
}

export function UserNav({ user, onSignOut }: UserNavProps) {
  const router = useRouter();

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FX";

  const dashboardHref = ROLE_DASHBOARD_ROUTES[user.role] || "/dashboard/customer";
  const roleBadge = ROLE_BADGE_VARIANTS[user.role];

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="relative size-9 rounded-full ring-2 ring-teal-600/20 hover:ring-teal-600/50 transition-all p-0"
              aria-label="Open user menu"
            />
          }
        >
          <Avatar className="size-9">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="bg-teal-100 text-teal-800 font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64 p-2 shadow-lg rounded-xl border border-slate-200" align="end">
          {/* Header with User Info and Role Badge */}
          <DropdownMenuLabel className="font-normal px-2 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col space-y-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] shrink-0 font-semibold ${roleBadge.className}`}
              >
                {roleBadge.label}
              </Badge>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Role specific quick links */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer gap-2.5 py-2 text-slate-700 hover:text-teal-900 focus:bg-teal-50"
              onClick={() => router.push(dashboardHref)}
            >
              <LayoutDashboard className="size-4 text-teal-700" />
              <span className="font-medium">Dashboard</span>
              <span className="ml-auto text-[10px] text-slate-400 capitalize">
                {user.role}
              </span>
            </DropdownMenuItem>

            {user.role === "customer" && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer gap-2.5 py-2 text-slate-700 hover:text-teal-900 focus:bg-teal-50"
                  onClick={() => router.push("/dashboard/customer/bookings")}
                >
                  <CalendarCheck className="size-4 text-slate-500" />
                  <span>My Bookings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2.5 py-2 text-slate-700 hover:text-teal-900 focus:bg-teal-50"
                  onClick={() => router.push("/dashboard/customer/payments")}
                >
                  <CreditCard className="size-4 text-slate-500" />
                  <span>Payment History</span>
                </DropdownMenuItem>
              </>
            )}

            {user.role === "technician" && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer gap-2.5 py-2 text-slate-700 hover:text-teal-900 focus:bg-teal-50"
                  onClick={() => router.push("/dashboard/technician/my-services")}
                >
                  <Wrench className="size-4 text-slate-500" />
                  <span>My Services</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2.5 py-2 text-slate-700 hover:text-teal-900 focus:bg-teal-50"
                  onClick={() => router.push("/dashboard/technician/requests")}
                >
                  <CalendarCheck className="size-4 text-slate-500" />
                  <span>Job Requests</span>
                </DropdownMenuItem>
              </>
            )}

            {user.role === "admin" && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer gap-2.5 py-2 text-slate-700 hover:text-teal-900 focus:bg-teal-50"
                  onClick={() => router.push("/dashboard/admin/services")}
                >
                  <ShieldCheck className="size-4 text-slate-500" />
                  <span>Moderate Services</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2.5 py-2 text-slate-700 hover:text-teal-900 focus:bg-teal-50"
                  onClick={() => router.push("/dashboard/admin/users")}
                >
                  <Users className="size-4 text-slate-500" />
                  <span>Manage Users</span>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuItem
              className="cursor-pointer gap-2.5 py-2 text-slate-700 hover:text-teal-900 focus:bg-teal-50"
              onClick={() => router.push("/dashboard/profile")}
            >
              <UserIcon className="size-4 text-slate-500" />
              <span>Update Profile</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          {/* Sign Out */}
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer gap-2.5 py-2 text-red-600 focus:bg-red-50 focus:text-red-700 font-medium"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
