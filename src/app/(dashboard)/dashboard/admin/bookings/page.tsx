"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Booking, BookingStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { getAdminBookings } from "@/lib/action/api/adminApi";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  Search,
  Eye,
  X,
  CreditCard,
  MapPin,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loadState, setLoadState] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [loadError, setLoadError] = React.useState("");
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState("loading");
      try {
        const data = await getAdminBookings();
        if (cancelled) return;
        setBookings(Array.isArray(data) ? data : []);
        setLoadState("ready");
      } catch (err: unknown) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "Could not load bookings. Please try again."
        );
        setLoadState("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);

  // Filter bookings
  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.technicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b._id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const statusCounts = {
    all: bookings.length,
    requested: bookings.filter((b) => b.status === "requested").length,
    accepted: bookings.filter((b) => b.status === "accepted").length,
    "in-progress": bookings.filter((b) => b.status === "in-progress").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        heading="All Bookings"
        description="Comprehensive platform registry of all customer service requests and technician work orders."
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-teal-300 text-teal-800 bg-teal-50 px-3 py-1 font-medium">
            {bookings.length} Total Bookings
          </Badge>
        </div>
      </PageHeader>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
          {[
            { id: "all", label: "All", count: statusCounts.all },
            { id: "requested", label: "Requested", count: statusCounts.requested },
            { id: "accepted", label: "Accepted", count: statusCounts.accepted },
            { id: "in-progress", label: "In Progress", count: statusCounts["in-progress"] },
            { id: "completed", label: "Completed", count: statusCounts.completed },
            { id: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
            { id: "rejected", label: "Rejected", count: statusCounts.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap",
                statusFilter === tab.id
                  ? "bg-white text-teal-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  statusFilter === tab.id
                    ? "bg-teal-100 text-teal-800"
                    : "bg-slate-200 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search service, customer, technician..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-white border-slate-200 focus-visible:ring-teal-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="border-slate-200 shadow-xs bg-white overflow-hidden">
        <CardContent className="p-0">
          {loadState === "loading" ? (
            <div className="divide-y divide-slate-100" role="status" aria-label="Loading bookings">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                  <div className="size-10 rounded-lg bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                    <div className="h-3 w-1/4 rounded bg-slate-100" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : loadState === "error" ? (
            <EmptyState
              icon={AlertCircle}
              title="Could not load bookings"
              description={loadError}
              actionLabel="Try Again"
              onAction={() => setReloadKey((key) => key + 1)}
            />
          ) : filteredBookings.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No bookings found"
              description="No work orders matched your selected status filter or search query."
              actionLabel="Clear Filters"
              onAction={() => {
                setStatusFilter("all");
                setSearchQuery("");
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Booking / Service</th>
                    <th scope="col" className="px-6 py-3.5">Customer</th>
                    <th scope="col" className="px-6 py-3.5">Technician</th>
                    <th scope="col" className="px-6 py-3.5">Date & Location</th>
                    <th scope="col" className="px-6 py-3.5">Job Status</th>
                    <th scope="col" className="px-6 py-3.5">Payment</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Booking / Service */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={b.serviceImage}
                              alt={b.serviceTitle}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-slate-900 truncate">
                              {b.serviceTitle}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              #{b._id.slice(-6).toUpperCase()} • {b.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 text-xs">
                        <p className="font-semibold text-slate-900">{b.customerName}</p>
                        <p className="text-slate-500 truncate max-w-xs">{b.customerEmail}</p>
                        <p className="text-[11px] text-slate-400">{b.customerPhone}</p>
                      </td>

                      {/* Technician */}
                      <td className="px-6 py-4 text-xs">
                        <p className="font-semibold text-slate-900">{b.technicianName}</p>
                        <p className="text-slate-500 truncate max-w-xs">{b.technicianEmail}</p>
                      </td>

                      {/* Date & Location */}
                      <td className="px-6 py-4 text-xs">
                        <p className="font-medium text-slate-800">
                          {formatDate(b.preferredDate)}
                        </p>
                        <p className="text-slate-500 truncate max-w-xs" title={b.address}>
                          {b.address}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={b.status} />
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <p className="font-bold text-slate-900">
                          {formatCurrency(b.finalAmount || b.basePrice)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Base: {formatCurrency(b.basePrice)}
                        </p>
                        {b.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-[11px]">
                            <CheckCircle2 className="size-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-amber-700 text-[11px]">
                            <Clock className="size-3" /> Unpaid
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBooking(b)}
                          className="h-8 text-xs font-semibold gap-1 border-slate-200 hover:border-teal-500 hover:text-teal-700"
                        >
                          <Eye className="size-3.5 text-teal-600" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <CalendarCheck className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Booking #{selectedBooking._id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500">Full work order audit record</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="font-semibold text-sm text-slate-900">{selectedBooking.serviceTitle}</p>
                <p className="text-xs text-slate-500">{selectedBooking.category}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={selectedBooking.status} />
                <span className="text-xs font-bold text-teal-800">
                  {formatCurrency(selectedBooking.finalAmount || selectedBooking.basePrice)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <span className="text-slate-400 font-medium">Customer Details</span>
                <p className="font-semibold text-slate-900">{selectedBooking.customerName}</p>
                <p className="text-slate-600">{selectedBooking.customerEmail}</p>
                <p className="text-slate-600">{selectedBooking.customerPhone}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <span className="text-slate-400 font-medium">Technician Assigned</span>
                <p className="font-semibold text-slate-900">{selectedBooking.technicianName}</p>
                <p className="text-slate-600">{selectedBooking.technicianEmail}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-medium">Problem Description:</span>
              <p className="text-slate-700 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-200">
                &ldquo;{selectedBooking.problemDescription}&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400">Scheduled Date:</span>
                <p className="font-semibold text-slate-800">{formatDate(selectedBooking.preferredDate)}</p>
              </div>
              <div>
                <span className="text-slate-400">Payment Status:</span>
                <p className="font-semibold capitalize text-slate-800">
                  {selectedBooking.paymentStatus}
                </p>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200">
                <span className="text-slate-400">Service Address:</span>
                <p className="font-medium text-slate-800">{selectedBooking.address}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBooking(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
