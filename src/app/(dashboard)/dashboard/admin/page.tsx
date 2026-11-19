"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MiniBarChart, MiniDonutChart } from "@/components/shared/mini-chart";
import { AdminServiceImage } from "@/components/dashboard/admin-service-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Service, Booking, Payment, User } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { getSuccessfulPayments } from "@/lib/admin-metrics";
import { ApiError } from "@/lib/api";
import { useCurrentUser } from "@/lib/session";
import {
  getAdminUsers,
  getAdminServices,
  getAdminBookings,
  getAdminPayments,
  setServiceApproval,
} from "@/lib/action/api/adminApi";
import { toast } from "sonner";
import {
  Users,
  ShieldAlert,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  Check,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, isPending } = useCurrentUser();
  const [users, setUsers] = React.useState<User[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const [busyServiceId, setBusyServiceId] = React.useState<string | null>(null);
  const [serviceDecision, setServiceDecision] = React.useState<{
    service: Service;
    approvalStatus: "approved" | "rejected";
  } | null>(null);

  React.useEffect(() => {
    if (isPending || user?.role !== "admin") return;

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [userRows, serviceRows, bookingRows, paymentRows] =
          await Promise.all([
            getAdminUsers(),
            getAdminServices(),
            getAdminBookings(),
            getAdminPayments(),
          ]);
        if (cancelled) return;
        setUsers(Array.isArray(userRows) ? userRows : []);
        setServices(Array.isArray(serviceRows) ? serviceRows : []);
        setBookings(Array.isArray(bookingRows) ? bookingRows : []);
        setPayments(Array.isArray(paymentRows) ? paymentRows : []);
      } catch (err: unknown) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load the admin dashboard. Please try again."
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isPending, user?.role, reloadKey]);

  const totalUsers = users.length;
  const totalTechnicians = users.filter((u) => u.role === "technician").length;
  const pendingServices = services.filter((s) => s.approvalStatus === "pending");
  const approvedServices = services.filter((s) => s.approvalStatus === "approved");
  const successfulPayments = getSuccessfulPayments(payments);
  const totalRevenue = successfulPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const confirmServiceDecision = async () => {
    if (!serviceDecision) return;
    const { service, approvalStatus } = serviceDecision;
    setBusyServiceId(service._id);
    try {
      const { service: updated } = await setServiceApproval(
        service._id,
        approvalStatus
      );
      setServices((prev) =>
        prev.map((row) => (row._id === updated._id ? { ...row, ...updated } : row))
      );
      if (approvalStatus === "approved") {
        toast.success(
          updated.isAvailable
            ? `Service "${service.title}" approved and published.`
            : `Service "${service.title}" approved. It remains hidden while unavailable.`
        );
      } else {
        toast.success(`Service "${service.title}" rejected.`);
      }
      setServiceDecision(null);
    } catch (err: unknown) {
      toast.error(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Could not update the service."
      );
    } finally {
      setBusyServiceId(null);
    }
  };

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
    {
      label: "Closed",
      value: bookings.filter((b) => ["rejected", "cancelled"].includes(b.status))
        .length,
    },
  ];

  const categoryDistribution = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const service of services) {
      counts.set(service.category, (counts.get(service.category) ?? 0) + 1);
    }
    const palette = ["#0d9488", "#0284c7", "#f59e0b", "#8b5cf6", "#64748b"];
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value], index) => ({
        label,
        value,
        color: palette[index % palette.length],
      }));
  }, [services]);

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading admin dashboard">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((key) => (
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
          heading="Admin Dashboard"
          description="Platform health, moderation queue, and transaction oversight."
        />
        <Card className="border-red-200 bg-red-50/60">
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="size-5" />
              <p className="font-semibold">Could not load the dashboard</p>
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
        heading="Admin Dashboard"
        description="Fixora platform health, moderation queue, user management, and transaction oversight."
      >
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/services">
            <Button variant="outline" size="sm" className="gap-1.5 font-medium">
              <ShieldCheck className="size-4 text-teal-600" />
              Service Moderation
              {pendingServices.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                  {pendingServices.length}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/admin/users">
            <Button
              size="sm"
              className="bg-teal-700 hover:bg-teal-800 text-white font-medium gap-1.5"
            >
              <Users className="size-4" />
              Manage Users
            </Button>
          </Link>
        </div>
      </PageHeader>

      {pendingServices.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-amber-950">
                {pendingServices.length}{" "}
                {pendingServices.length === 1 ? "Service" : "Services"} Pending
                Moderation
              </p>
              <p className="text-xs text-amber-800">
                Technicians are waiting for approval before their listings appear
                publicly.
              </p>
            </div>
          </div>
          <Link href="/dashboard/admin/services">
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-1.5 shrink-0"
            >
              Review Queue
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          subtitle={`${users.filter((u) => u.role === "customer").length} customers`}
          icon={Users}
          iconClassName="bg-teal-50 text-teal-700"
        />
        <StatCard
          title="Total Technicians"
          value={totalTechnicians}
          subtitle="Technician accounts"
          icon={ShieldCheck}
          iconClassName="bg-indigo-50 text-indigo-700"
        />
        <StatCard
          title="Pending Services"
          value={pendingServices.length}
          subtitle={`${approvedServices.length} approved in catalog`}
          icon={ShieldAlert}
          iconClassName="bg-amber-50 text-amber-700"
        />
        <StatCard
          title="Settled Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle={`${successfulPayments.length} successful payments`}
          icon={TrendingUp}
          iconClassName="bg-emerald-50 text-emerald-700"
        />
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No services on the platform yet"
          description="Technician listings appear here as soon as they publish a service."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MiniBarChart
              title="Bookings by status"
              subtitle="Live platform-wide work order pipeline"
              data={statusChartData}
            />
          </div>
          <div>
            <MiniDonutChart
              title="Services by Category"
              subtitle="All submitted service listings"
              data={categoryDistribution}
              centerValue={services.length}
              centerLabel="Services"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="size-4 text-amber-500" />
                Pending Service Approvals
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                New listings submitted by technicians needing review
              </p>
            </div>
            <Link
              href="/dashboard/admin/services"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 hover:underline"
            >
              View All ({services.length})
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            {pendingServices.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-2">
                  <Sparkles className="size-5" />
                </div>
                <p className="font-semibold text-sm text-slate-900">
                  Queue is clear
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every technician service has been reviewed.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingServices.slice(0, 4).map((service) => (
                  <div
                    key={service._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <AdminServiceImage
                        src={service.image}
                        alt={service.title}
                        className="size-12 rounded-lg shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">
                          {service.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {service.technicianName} • {service.category}
                        </p>
                        <p className="text-xs font-semibold text-teal-700 mt-0.5">
                          {formatCurrency(service.basePrice)} • {service.serviceMode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Button
                        size="sm"
                        onClick={() =>
                          setServiceDecision({
                            service,
                            approvalStatus: "approved",
                          })
                        }
                        disabled={busyServiceId === service._id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold gap-1"
                      >
                        <Check className="size-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setServiceDecision({
                            service,
                            approvalStatus: "rejected",
                          })
                        }
                        disabled={busyServiceId === service._id}
                        className="border-rose-200 text-rose-700 hover:bg-rose-50 h-8 text-xs font-semibold gap-1"
                      >
                        <X className="size-3.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="size-4 text-teal-600" />
                Recent Work Orders
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest customer repair bookings across Fixora
              </p>
            </div>
            <Link
              href="/dashboard/admin/bookings"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 hover:underline"
            >
              View All ({bookings.length})
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            {bookings.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={CalendarCheck}
                  title="No bookings yet"
                  description="Customer repair requests will appear here."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bookings.slice(0, 4).map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-4 gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">
                        {booking.serviceTitle}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Customer:{" "}
                        <span className="text-slate-700">
                          {booking.customerName}
                        </span>{" "}
                        • Tech:{" "}
                        <span className="text-slate-700">
                          {booking.technicianName}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(booking.createdAt || booking.preferredDate)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={booking.status} />
                      <span className="text-xs font-semibold text-slate-800">
                        {formatCurrency(booking.finalAmount || booking.basePrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={Boolean(serviceDecision)}
        onClose={() => setServiceDecision(null)}
        onConfirm={confirmServiceDecision}
        title={
          serviceDecision?.approvalStatus === "approved"
            ? "Approve this service?"
            : "Reject this service?"
        }
        description={
          serviceDecision
            ? `"${serviceDecision.service.title}" will be ${
                serviceDecision.approvalStatus === "approved"
                  ? serviceDecision.service.isAvailable
                    ? "approved and visible to customers"
                    : "approved but remain hidden until it is available"
                  : "marked as rejected"
              }.`
            : ""
        }
        confirmLabel={
          serviceDecision?.approvalStatus === "approved" ? "Approve" : "Reject"
        }
        variant={
          serviceDecision?.approvalStatus === "approved" ? "success" : "danger"
        }
        isLoading={Boolean(
          serviceDecision && busyServiceId === serviceDecision.service._id
        )}
      />
    </div>
  );
}
