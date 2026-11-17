"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { MiniBarChart, MiniDonutChart } from "@/components/shared/mini-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_USERS } from "@/data/users";
import { DUMMY_SERVICES } from "@/data/services";
import { DUMMY_BOOKINGS } from "@/data/bookings";
import { DUMMY_PAYMENTS } from "@/data/payments";
import { Service } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
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
} from "lucide-react";

export default function AdminDashboardPage() {
  // Local state for interactive moderation in the quick view
  const [services, setServices] = React.useState<Service[]>(DUMMY_SERVICES);

  // Statistics
  const totalUsers = DUMMY_USERS.length;
  const totalCustomers = DUMMY_USERS.filter((u) => u.role === "customer").length;
  const totalTechnicians = DUMMY_USERS.filter((u) => u.role === "technician").length;

  const pendingServices = services.filter((s) => s.approvalStatus === "pending");
  const approvedServices = services.filter((s) => s.approvalStatus === "approved");

  const totalBookings = DUMMY_BOOKINGS.length;
  const activeBookings = DUMMY_BOOKINGS.filter((b) =>
    ["requested", "accepted", "in-progress"].includes(b.status)
  ).length;

  const totalRevenue = DUMMY_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);

  // Approve handler
  const handleApprove = (serviceId: string, title: string) => {
    // TODO(owner): replace with API call: PATCH /api/admin/services/:id/approval { status: "approved" }
    setServices((prev) =>
      prev.map((s) => (s._id === serviceId ? { ...s, approvalStatus: "approved" } : s))
    );
    toast.success(`Service "${title}" approved and published to catalog`);
  };

  // Reject handler
  const handleReject = (serviceId: string, title: string) => {
    // TODO(owner): replace with API call: PATCH /api/admin/services/:id/approval { status: "rejected" }
    setServices((prev) =>
      prev.map((s) => (s._id === serviceId ? { ...s, approvalStatus: "rejected" } : s))
    );
    toast.error(`Service "${title}" rejected`);
  };

  // Monthly bookings chart data
  const monthlyBookingsData = [
    { label: "Jun", value: 3 },
    { label: "Jul", value: 5 },
    { label: "Aug", value: 4 },
    { label: "Sep", value: 7 },
    { label: "Oct", value: 9 },
    { label: "Nov", value: 12, highlight: true },
  ];

  // Category distribution
  const categoryDistribution = [
    { label: "Smartphone", value: 4, color: "#0d9488" },
    { label: "Laptop & PC", value: 3, color: "#0284c7" },
    { label: "AC", value: 2, color: "#f59e0b" },
    { label: "Appliances", value: 3, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {pendingServices.length}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/admin/users">
            <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white font-medium gap-1.5">
              <Users className="size-4" />
              Manage Users
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Pending Moderation Callout if there are services waiting */}
      {pendingServices.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-amber-950">
                {pendingServices.length} {pendingServices.length === 1 ? "Service" : "Services"} Pending Moderation
              </p>
              <p className="text-xs text-amber-800">
                Technicians are waiting for admin approval before their listings appear in the public catalog.
              </p>
            </div>
          </div>
          <Link href="/dashboard/admin/services">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-1.5 shrink-0">
              Review Queue
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Platform Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Users"
          value={totalUsers}
          subtitle={`${totalCustomers} customers • ${totalTechnicians} technicians`}
          icon={Users}
          iconClassName="bg-teal-50 text-teal-700"
          trend={{ value: "+2 this week", isPositive: true }}
        />
        <StatCard
          title="Catalog Services"
          value={approvedServices.length}
          subtitle={`${pendingServices.length} pending review`}
          icon={ShieldCheck}
          iconClassName="bg-indigo-50 text-indigo-700"
        />
        <StatCard
          title="Active Work Orders"
          value={activeBookings}
          subtitle={`${totalBookings} total platform bookings`}
          icon={CalendarCheck}
          iconClassName="bg-amber-50 text-amber-700"
          trend={{ value: "+18% vs last month", isPositive: true }}
        />
        <StatCard
          title="Settled Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle={`${DUMMY_PAYMENTS.length} processed payments`}
          icon={TrendingUp}
          iconClassName="bg-emerald-50 text-emerald-700"
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MiniBarChart
            title="Platform Bookings Growth"
            subtitle="Monthly repair service requests initiated across all categories"
            data={monthlyBookingsData}
          />
        </div>

        <div>
          <MiniDonutChart
            title="Services by Category"
            subtitle="Distribution of active service offerings"
            data={categoryDistribution}
            centerValue="12"
            centerLabel="Services"
          />
        </div>
      </div>

      {/* Two Column Section: Quick Service Moderation + Recent Platform Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Service Queue */}
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
                <p className="font-semibold text-sm text-slate-900">Queue is Clear!</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  All technician services have been reviewed.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingServices.map((service) => (
                  <div
                    key={service._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="size-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={service.image}
                          alt={service.title}
                          className="size-full object-cover"
                        />
                      </div>
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
                        onClick={() => handleApprove(service._id, service.title)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold gap-1"
                      >
                        <Check className="size-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(service._id, service.title)}
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

        {/* Recent Platform Bookings */}
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
              View All ({DUMMY_BOOKINGS.length})
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {DUMMY_BOOKINGS.slice(0, 4).map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-4 gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">
                      {booking.serviceTitle}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Customer: <span className="text-slate-700">{booking.customerName}</span> • Tech:{" "}
                      <span className="text-slate-700">{booking.technicianName}</span>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
