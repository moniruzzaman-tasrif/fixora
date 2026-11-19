"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/constants";
import { useCurrentUser } from "@/lib/session";

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isPending } = useCurrentUser();

  React.useEffect(() => {
    if (user) {
      router.replace(ROLE_DASHBOARD_ROUTES[user.role]);
    }
  }, [router, user]);

  if (isPending || user) {
    return (
      <div
        className="flex min-h-64 items-center justify-center text-teal-700"
        role="status"
        aria-label="Checking your account"
      >
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  return children;
}
