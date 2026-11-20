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
import { Booking } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { getMyBookings } from "@/lib/action/api/customerApi";
import { useCurrentUser } from "@/lib/session";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  CreditCard,
  Wrench,
  AlertCircle,
} from "lucide-react";

const ACTIVE_STATUSES = ["requested", "accepted", "in-progress"];

function buildMonthlyActivity(bookings: Booking[]) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleString("en-US", { month: "short" }),
      value: 0,
      highlight: index === 5,
    };
  });

  for (const booking of bookings) {
    const raw = booking.createdAt || booking.preferredDate;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) continue;

    const month = months.find(
      (item) => item.key === `${date.getFullYear()}-${date.getMonth()}`
    );
    if (month) month.value += 1;
  }

  return months;
}

export default function CustomerDashboardPage() {
  const { user, isPending } = useCurrentUser();

  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loadState, setLoadState] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (isPending || user?.role !== "customer" || !user._id) return;

    let cancelled = false;

    getMyBookings()
      .then((data) => {
        if (cancelled) return;
        setBookings(data);
        setLoadState("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load customer dashboard bookings:", error);
        setLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [isPending, user?._id, user?.role, reloadKey]);

  const handleRetry = () => {
    setLoadState("loading");
    setReloadKey((key) => key + 1);
  };

  const isLoading = isPending || loadState === "loading";

  const totalRequests = bookings.length;
  const activeJobs = bookings.filter((b) =>
    ACTIVE_STATUSES.includes(b.status)
  ).length;
  const completedJobs = bookings.filter((b) => b.status === "completed").length;
  const pendingPayment = bookings.filter(
    (b) => b.status === "completed" && b.paymentStatus !== "paid"
  ).length;

  // Only computed once the data is in: Next 16 forbids reading the current
  // time during prerender of a client component.
  const activityData =
    isLoading || loadState === "error" ? [] : buildMonthlyActivity(bookings);

  const statusDonutData = [
    { label: "Active Jobs", value: activeJobs, color: "#f59e0b" },
    { label: "Completed", value: completedJobs, color: "#10b981" },
    {
      label: "Cancelled / Rejected",
      value: Math.max(totalRequests - activeJobs - completedJobs, 0),
      color: "#64748b",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Customer Dashboard"
        description="Track your repair requests, manage technician visits, and settle completed jobs."
      >
        <Link href="/services">
          <Button className="bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 shadow-xs">
            <PlusCircle className="size-4" />
            Book a New Repair
          </Button>
        </Link>
      </PageHeader>

      {isLoading ? (
        <DashboardSkeleton />
      ) : loadState === "error" ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load your dashboard"
          description="We could not reach the repair service server. Check your connection and try again."
          actionLabel="Try Again"
          onAction={handleRetry}
        />
      ) : (
        <>
          {pendingPayment > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500 text-white shrink-0">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    You have {pendingPayment} completed job
                    {pendingPayment === 1 ? "" : "s"} awaiting payment!
                  </p>
                  <p className="text-xs text-amber-700">
                    Your technician has marked the work complete. Review the
                    final amount before paying.
                  </p>
                </div>
              </div>
              <Link href="/dashboard/customer/bookings">
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0"
                >
                  Pay Now
                </Button>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Requests"
              value={totalRequests}
              subtitle="All-time repair requests"
              icon={CalendarCheck}
              iconClassName="bg-teal-50 text-teal-700"
            />
            <StatCard
              title="Active Jobs"
              value={activeJobs}
              subtitle="In progress or awaiting technician"
              icon={Clock}
              iconClassName="bg-amber-50 text-amber-600"
              trend={
                activeJobs > 0
                  ? { value: `${activeJobs} ongoing`, isPositive: true }
                  : undefined
              }
            />
            <StatCard
              title="Completed Jobs"
              value={completedJobs}
              subtitle="Jobs marked complete"
              icon={CheckCircle2}
              iconClassName="bg-emerald-50 text-emerald-600"
            />
          </div>

          {totalRequests === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No repair requests yet"
              description="Browse available services and send your first repair request. Payment is due after the job is completed."
              actionLabel="Browse Repair Services"
              actionHref="/services"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <MiniBarChart
                    title="Monthly Repair Activity"
                    subtitle="Your repair requests over the last six months"
                    data={activityData}
                  />
                </div>
                <div className="lg:col-span-1">
                  <MiniDonutChart
                    title="Job Status Breakdown"
                    subtitle="Current status distribution"
                    data={statusDonutData}
                    centerValue={totalRequests}
                    centerLabel="Total Jobs"
                  />
                </div>
              </div>

              <Card className="border border-slate-200/90 shadow-xs">
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Recent Repair Bookings
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your latest submitted requests and service tracking status
                    </p>
                  </div>
                  <Link
                    href="/dashboard/customer/bookings"
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-y border-slate-200/80">
                        <tr>
                          <th className="px-5 py-3">Service</th>
                          <th className="px-5 py-3">Technician</th>
                          <th className="px-5 py-3">Preferred Date</th>
                          <th className="px-5 py-3">Amount</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bookings.slice(0, 4).map((booking) => (
                          <tr
                            key={booking._id}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            <td className="px-5 py-3.5 font-medium text-slate-900">
                              <div className="font-semibold">
                                {booking.serviceTitle}
                              </div>
                              <div className="text-xs text-slate-400">
                                {booking.category}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-600">
                              {booking.technicianName}
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-600">
                              {formatDate(booking.preferredDate)}
                            </td>
                            <td className="px-5 py-3.5 text-xs font-bold text-slate-900">
                              {formatCurrency(
                                booking.finalAmount || booking.basePrice
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusBadge status={booking.status} />
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <RecentBookingAction booking={booking} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {bookings.slice(0, 4).map((booking) => (
                      <div key={booking._id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {booking.serviceTitle}
                            </p>
                            <p className="text-xs text-slate-500">
                              {booking.technicianName}
                            </p>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{formatDate(booking.preferredDate)}</span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(
                              booking.finalAmount || booking.basePrice
                            )}
                          </span>
                        </div>
                        <RecentBookingAction booking={booking} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

function RecentBookingAction({ booking }: { booking: Booking }) {
  if (booking.status === "completed" && booking.paymentStatus !== "paid") {
    return (
      <Link href="/dashboard/customer/bookings">
        <Button
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7 px-2.5 w-full md:w-auto"
        >
          Pay Now
        </Button>
      </Link>
    );
  }

  return (
    <Link href="/dashboard/customer/bookings">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs h-7 text-slate-600 w-full md:w-auto"
      >
        Details
      </Button>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
      <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}
