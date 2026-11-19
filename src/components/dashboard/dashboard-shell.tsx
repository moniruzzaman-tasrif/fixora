"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/constants";
import { useCurrentUser } from "@/lib/session";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * Role implied by a role-specific dashboard URL. `/dashboard/profile` is shared
 * by every role, so it returns `null` and is never treated as a mismatch.
 */
function getRouteRole(pathname: string): UserRole | null {
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  if (pathname.startsWith("/dashboard/technician")) return "technician";
  if (pathname.startsWith("/dashboard/customer")) return "customer";
  return null;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isPending } = useCurrentUser();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const sessionUserId = user?._id;
  const sessionUserRole = user?.role;
  const routeRole = getRouteRole(pathname);

  // Frontend redirects are UX only; the server remains the source of truth for
  // authorization (see AGENTS.md §13).
  React.useEffect(() => {
    if (isPending) return;

    if (!sessionUserId) {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/sign-in?callbackUrl=${callbackUrl}`);
      return;
    }

    if (routeRole && sessionUserRole && routeRole !== sessionUserRole) {
      router.replace(ROLE_DASHBOARD_ROUTES[sessionUserRole]);
    }
  }, [isPending, sessionUserId, sessionUserRole, routeRole, pathname, router]);

  const isWrongRole = Boolean(
    sessionUserRole && routeRole && routeRole !== sessionUserRole
  );
  const isReady = !isPending && Boolean(user) && !isWrongRole;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-700">
      {/* Sidebar Navigation */}
      {user ? (
        <DashboardSidebar
          user={user}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      ) : (
        <div className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-white" />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {user ? (
          <DashboardTopbar
            user={user}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />
        ) : (
          <div className="h-16 shrink-0 border-b border-slate-200 bg-white" />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div
            className={cn("mx-auto max-w-7xl", !isReady && "hidden")}
            aria-hidden={!isReady}
          >
            {children}
          </div>

          {!isReady && <DashboardContentSkeleton />}
        </main>
      </div>
    </div>
  );
}

/** Shown while the session loads or while a redirect is in flight. */
function DashboardContentSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl space-y-6"
      role="status"
      aria-label="Loading dashboard"
    >
      <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}
