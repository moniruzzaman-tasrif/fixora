"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { MiniBarChart, MiniDonutChart } from "@/components/shared/mini-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DUMMY_SERVICES } from "@/data/services";
import { DUMMY_BOOKINGS } from "@/data/bookings";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Wrench,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function TechnicianDashboardPage() {
  // TODO(owner): replace with API calls
  const myServices = DUMMY_SERVICES.filter(
    (s) => s.technicianEmail === "tanvir.tech@fixora.com"
  );
  const myRequests = DUMMY_BOOKINGS.filter(
    (b) => b.technicianEmail === "tanvir.tech@fixora.com"
  );

  const totalServices = myServices.length;
  const approvedServices = myServices.filter(
    (s) => s.approvalStatus === "approved"
  ).length;
  const pendingRequests = myRequests.filter((b) => b.status === "requested").length;

  const weeklyEarnings = [
    { label: "Mon", value: 45 },
    { label: "Tue", value: 80 },
    { label: "Wed", value: 35 },
    { label: "Thu", value: 110, highlight: true },
    { label: "Fri", value: 65 },
    { label: "Sat", value: 95 },
    { label: "Sun", value: 50 },
  ];

  const serviceCategoriesData = [
    { label: "Smartphone", value: 2, color: "#0f766e" },
    { label: "Laptop & PC", value: 2, color: "#0ea5e9" },
    { label: "Other", value: 1, color: "#64748b" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Technician Operations"
        description="Manage your repair listings, accept incoming device bookings, and track daily service earnings."
      >
        <Link href="/dashboard/technician/add-service">
          <Button className="bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 shadow-xs">
            <PlusCircle className="size-4" />
            Add New Service
          </Button>
        </Link>
      </PageHeader>

      {/* Overview Stat Cards */}
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
          trend={{ value: `${Math.round((approvedServices / totalServices) * 100)}% approved`, isPositive: true }}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          subtitle="New client jobs awaiting review"
          icon={Clock}
          iconClassName="bg-amber-50 text-amber-600"
          trend={{ value: "Action needed", isPositive: false }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MiniBarChart
            title="Weekly Revenue Overview (USD)"
            subtitle="Estimated income from completed repair jobs"
            data={weeklyEarnings}
            valuePrefix="$"
          />
        </div>
        <div className="lg:col-span-1">
          <MiniDonutChart
            title="Services by Category"
            subtitle="Your active specialization"
            data={serviceCategoriesData}
            centerValue={totalServices}
            centerLabel="Catalog"
          />
        </div>
      </div>

      {/* Urgent Incoming Requests Preview */}
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
                {myRequests.slice(0, 4).map((request) => (
                  <tr key={request._id} className="hover:bg-slate-50/70 transition-colors">
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
                        <Button size="sm" variant="outline" className="text-xs h-7 text-teal-700 border-teal-200 hover:bg-teal-50">
                          View Job
                        </Button>
                      </Link>
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
