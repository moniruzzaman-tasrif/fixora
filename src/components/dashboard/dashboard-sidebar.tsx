"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Badge } from "@/components/ui/badge";
import { User, UserRole } from "@/types";
import { ROLE_BADGE_VARIANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Wrench,
  PlusCircle,
  ShieldCheck,
  Users,
  Receipt,
  UserCheck,
  ArrowLeft,
  X,
  LucideIcon,
} from "lucide-react";

interface SidebarLink {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface DashboardSidebarProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({
  user,
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  // The shell only renders the sidebar once the BetterAuth session is loaded,
  // so `user.role` is already the role stored in the database.
  const activeRole: UserRole = user.role;

  // Role-specific navigation items
  const customerLinks: SidebarLink[] = [
    {
      title: "Overview",
      href: "/dashboard/customer",
      icon: LayoutDashboard,
    },
    {
      title: "My Bookings",
      href: "/dashboard/customer/bookings",
      icon: CalendarCheck,
    },
    {
      title: "Payment History",
      href: "/dashboard/customer/payments",
      icon: CreditCard,
    },
  ];

  const technicianLinks: SidebarLink[] = [
    {
      title: "Overview",
      href: "/dashboard/technician",
      icon: LayoutDashboard,
    },
    {
      title: "Add a Service",
      href: "/dashboard/technician/add-service",
      icon: PlusCircle,
    },
    {
      title: "My Services",
      href: "/dashboard/technician/my-services",
      icon: Wrench,
    },
    {
      title: "Manage Requests",
      href: "/dashboard/technician/requests",
      icon: CalendarCheck,
    },
  ];

  const adminLinks: SidebarLink[] = [
    {
      title: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Manage Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Service Approval",
      href: "/dashboard/admin/services",
      icon: ShieldCheck,
    },
    {
      title: "All Bookings",
      href: "/dashboard/admin/bookings",
      icon: CalendarCheck,
    },
    {
      title: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: Receipt,
    },
  ];

  const roleNavMap: Record<UserRole, SidebarLink[]> = {
    customer: customerLinks,
    technician: technicianLinks,
    admin: adminLinks,
  };

  const currentRoleLinks = roleNavMap[activeRole];
  const roleBadge = ROLE_BADGE_VARIANTS[activeRole];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-200/90 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-6">
            <Logo showTagline={false} size="default" />
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* User Role Pill */}
          <div className="p-4 mx-4 mt-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Portal
              </span>
              <Badge
                variant="outline"
                className={cn("text-[10px] font-bold", roleBadge.className)}
              >
                {roleBadge.label}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 font-semibold truncate mt-1">
              {user.name}
            </p>
          </div>

          {/* Main Navigation Links */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Dashboard Navigation
            </p>

            {currentRoleLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-teal-700 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4.5 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-teal-50 text-teal-700"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Account Settings
              </p>
              <Link
                href="/dashboard/profile"
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  pathname === "/dashboard/profile"
                    ? "bg-teal-700 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <UserCheck className="size-4.5 shrink-0" />
                <span>Update Profile</span>
              </Link>
            </div>
          </div>

          {/* Footer: Link back to Public Website */}
          <div className="p-4 border-t border-slate-200/80">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Public Site</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
