"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { MiniBarChart, MiniDonutChart } from "@/components/shared/mini-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DUMMY_BOOKINGS } from "@/data/bookings";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  CreditCard,
  Wrench,
} from "lucide-react";

export default function CustomerDashboardPage() {
  // Filter bookings for current demo customer
  // TODO(owner): replace with API call: GET /api/bookings/my
  const myBookings = DUMMY_BOOKINGS.filter(
    (b) => b.customerEmail === "rahim.customer@fixora.com"
  );

  const totalRequests = myBookings.length;
  const activeJobs = myBookings.filter((b) =>
    ["requested", "accepted", "in-progress"].includes(b.status)
  ).length;
  const completedJobs = myBookings.filter((b) => b.status === "completed").length;
  const pendingPayment = myBookings.filter(
    (b) => b.status === "completed" && b.paymentStatus === "unpaid"
  ).length;

  const activityData = [
    { label: "Jun", value: 1 },
    { label: "Jul", value: 2 },
    { label: "Aug", value: 1 },
    { label: "Sep", value: 3 },
    { label: "Oct", value: 2 },
    { label: "Nov", value: 4, highlight: true },
  ];

  const statusDonutData = [
    { label: "Active Jobs", value: activeJobs, color: "#f59e0b" },
    { label: "Completed", value: completedJobs, color: "#10b981" },
    { label: "Cancelled/Other", value: Math.max(totalRequests - activeJobs - completedJobs, 0), color: "#64748b" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
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

      {/* Pay Now Alert Banner if customer has unpaid completed jobs */}
      {pendingPayment > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500 text-white shrink-0">
              <CreditCard className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                You have {pendingPayment} completed job awaiting payment!
              </p>
              <p className="text-xs text-amber-700">
                Your technician has finished the work. Please review and pay securely via Stripe.
              </p>
            </div>
          </div>
          <Link href="/dashboard/customer/bookings">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0">
              Pay Now
            </Button>
          </Link>
        </div>
      )}

      {/* Overview Stat Cards */}
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
          trend={{ value: `${activeJobs} ongoing`, isPositive: true }}
        />
        <StatCard
          title="Completed Jobs"
          value={completedJobs}
          subtitle="Successfully delivered & verified"
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MiniBarChart
            title="Monthly Repair Activity"
            subtitle="Number of device and appliance repair bookings over time"
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

      {/* Recent Bookings Table Preview */}
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
          <div className="overflow-x-auto">
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
                {myBookings.slice(0, 4).map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div className="font-semibold">{booking.serviceTitle}</div>
                      <div className="text-xs text-slate-400">{booking.category}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {booking.technicianName}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {formatDate(booking.preferredDate)}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-900">
                      {formatCurrency(booking.finalAmount || booking.basePrice)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {booking.status === "completed" && booking.paymentStatus === "unpaid" ? (
                        <Link href="/dashboard/customer/bookings">
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7 px-2.5">
                            Pay Now
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/dashboard/customer/bookings">
                          <Button variant="ghost" size="sm" className="text-xs h-7 text-slate-600">
                            Details
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
