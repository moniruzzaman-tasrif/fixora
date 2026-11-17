"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DEMO_USERS } from "@/data/demo-session";
import { User, UserRole } from "@/types";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  // Detect appropriate demo user based on the route or state
  // TODO(owner): replace with BetterAuth session integration:
  // const { data: session } = authClient.useSession();
  const getInitialUser = (): User => {
    if (pathname.includes("/dashboard/admin")) return DEMO_USERS.admin;
    if (pathname.includes("/dashboard/technician")) return DEMO_USERS.technician;
    return DEMO_USERS.customer;
  };

  const [currentUser, setCurrentUser] = React.useState<User>(getInitialUser);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Sync role if navigation changes path
  React.useEffect(() => {
    if (pathname.includes("/dashboard/admin") && currentUser.role !== "admin") {
      setCurrentUser(DEMO_USERS.admin);
    } else if (
      pathname.includes("/dashboard/technician") &&
      currentUser.role !== "technician"
    ) {
      setCurrentUser(DEMO_USERS.technician);
    } else if (
      pathname.includes("/dashboard/customer") &&
      currentUser.role !== "customer"
    ) {
      setCurrentUser(DEMO_USERS.customer);
    }
  }, [pathname, currentUser.role]);

  const handleRoleSwitch = (role: UserRole) => {
    setCurrentUser(DEMO_USERS[role]);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        user={currentUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardTopbar
          user={currentUser}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onRoleSwitch={handleRoleSwitch}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
