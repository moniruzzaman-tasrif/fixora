"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { MiniBarChart, MiniDonutChart } from "@/components/shared/mini-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Service, Booking } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { getMyServices, getTechnicianBookings } from "@/lib/action/api/technicianApi";
import { useCurrentUser } from "@/lib/session";
import {
  Wrench,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function TechnicianDashboardPage() {
  const { user } = useCurrentUser();
  const [services, setServices] = React.useState<Service[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [myServices, myBookings] = await Promise.all([
          getMyServices(),
          getTechnicianBookings(),
        ]);
        if (cancelled) return;
        setServices(Array.isArray(myServices) ? myServices : []);
        setBookings(Array.isArray(myBookings) ? myBookings : []);
      } catch (err: unknown) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load your dashboard. Please try again."
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const totalServices = services.length;
  const approvedServices = services.filter(
    (service) => service.approvalStatus === "approved"
  ).length;
  const pendingRequests = bookings.filter(
    (booking) => booking.status === "requested"
  ).length;

  const statusChartData = [
    {
      label: "Requested",
      value: bookings.filter((b) => b.status === "requested").length,
      highlight: true,
    },
    {
      label: "Accepted",
      value: bookings.filter((b) => b.status === "accepted").length,
    },
    {
      label: "In Progress",
      value: bookings.filter((b) => b.status === "in-progress").length,
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length,
    },
  ];

  const categoryCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const service of services) {
      counts.set(service.category, (counts.get(service.category) ?? 0) + 1);
    }
    const palette = ["#0f766e", "#0ea5e9", "#7c3aed", "#f59e0b", "#64748b"];
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value], index) => ({
        label,
        value,
        color: palette[index % palette.length],
      }));
  }, [services]);

  const recentRequests = bookings.slice(0, 4);
  const displayName = user?.name ?? "Technician";

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading dashboard">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          heading="Technician Operations"
          description="Manage your repair listings and incoming device bookings."
        />
        <Card className="border-red-200 bg-red-50/60">
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="size-5" />
              <p className="font-semibold">Could not load your dashboard</p>
            </div>
            <p className="text-sm text-red-700/90">{error}</p>
            <Button
              variant="outline"
              onClick={() => setReloadKey((key) => key + 1)}
              className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Technician Operations"
        description={`Welcome back, ${displayName}. Manage your repair listings and incoming device bookings.`}
      >
        <Link href="/dashboard/technician/add-service">
          <Button className="bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 shadow-xs">
            <PlusCircle className="size-4" />
            Add New Service
          </Button>
        </Link>
      </PageHeader>

      {/* Overview Stat Cards — all values come from MongoDB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Services"
          value={totalServices}
          subtitle="Listed repair catalog items"
          icon={Wrench}
          iconClassName="bg-teal-50 text-teal-700"
        />
        <StatCard
          title="Approved Services"
          value={approvedServices}
          subtitle="Publicly visible on Fixora"
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          subtitle="New client jobs awaiting review"
          icon={Clock}
          iconClassName="bg-amber-50 text-amber-600"
        />
      </div>

      {totalServices === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services yet"
          description="Publish your first repair service so customers can book you. Every new service waits for admin approval before it appears publicly."
          actionLabel="Add a service"
          actionHref="/dashboard/technician/add-service"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MiniBarChart
              title="Your jobs by status"
              subtitle="Live counts from your assigned bookings"
              data={statusChartData}
            />
          </div>
          <div className="lg:col-span-1">
            <MiniDonutChart
              title="Services by Category"
              subtitle="Your listed specializations"
              data={categoryCounts}
              centerValue={totalServices}
              centerLabel="Catalog"
            />
          </div>
        </div>
      )}

      {/* Incoming requests preview */}
      <Card className="border border-slate-200/90 shadow-xs">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Incoming Job Requests
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Customers waiting for your confirmation or visit dispatch
            </p>
          </div>
          <Link
            href="/dashboard/technician/requests"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>Manage All Requests</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {recentRequests.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={Clock}
                title="No job requests yet"
                description="When a customer books one of your approved services, the request appears here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-y border-slate-200/80">
                  <tr>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Preferred Date</th>
                    <th className="px-5 py-3">Base Price</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRequests.map((request) => (
                    <tr
                      key={request._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 text-xs">
                          {request.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {request.customerPhone}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-700 font-medium">
                        {request.serviceTitle}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {formatDate(request.preferredDate)}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-900">
                        {formatCurrency(request.basePrice)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href="/dashboard/technician/requests">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 text-teal-700 border-teal-200 hover:bg-teal-50"
                          >
                            View Job
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
