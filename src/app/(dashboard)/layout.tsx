import * as React from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard — Fixora",
  description: "Manage your repair bookings, services, and profile on Fixora.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
