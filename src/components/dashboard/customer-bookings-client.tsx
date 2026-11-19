"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Booking, BookingStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { useCurrentUser } from "@/lib/session";
import {
  CreditCard,
  XCircle,
  PlusCircle,
  Check,
  Wrench,
} from "lucide-react";

interface CustomerBookingsClientProps {
  initialBookings: Booking[];
}

export function CustomerBookingsClient({
  initialBookings,
}: CustomerBookingsClientProps) {
  const { user } = useCurrentUser();

  // If a customer is logged in, show their bookings; otherwise show initial list
  const userEmail = user?.email?.toLowerCase();

  const [bookings, setBookings] = React.useState<Booking[]>(() => {
    if (!userEmail) return initialBookings;
    return initialBookings.filter(
      (b) => b.customerEmail?.toLowerCase() === userEmail
    );
  });

  // Re-sync when user session is loaded
  React.useEffect(() => {
    if (userEmail) {
      setBookings(
        initialBookings.filter(
          (b) => b.customerEmail?.toLowerCase() === userEmail
        )
      );
    } else {
      setBookings(initialBookings);
    }
  }, [userEmail, initialBookings]);

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [cancelModalBooking, setCancelModalBooking] =
    React.useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Filter bookings based on active status tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "active")
      return ["requested", "accepted", "in-progress"].includes(b.status);
    if (activeTab === "completed") return b.status === "completed";
    if (activeTab === "cancelled")
      return ["cancelled", "rejected"].includes(b.status);
    return b.status === activeTab;
  });

  // Handle Cancel Booking (allowed ONLY when status === 'requested')
  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setIsProcessing(true);

    try {
      // Seam for backend cancel route
      await new Promise((resolve) => setTimeout(resolve, 600));

      setBookings((prev) =>
        prev.map((b) =>
          b._id === cancelModalBooking._id
            ? { ...b, status: "cancelled" as BookingStatus }
            : b
        )
      );

      toast.success("Booking cancelled successfully.");
      setCancelModalBooking(null);
    } catch {
      toast.error("Failed to cancel booking. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Stripe Pay Now
  const handlePayNow = (booking: Booking) => {
    toast.info(
      `Redirecting to Stripe checkout for ${booking.serviceTitle} (${formatCurrency(
        booking.finalAmount || booking.basePrice
      )})...`
    );

    setTimeout(() => {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === booking._id ? { ...b, paymentStatus: "paid" } : b
        )
      );
      toast.success("Payment recorded successfully! Thank you for using Fixora.");
    }, 1200);
  };

  const tabs = [
    { id: "all", label: "All Bookings", count: bookings.length },
    {
      id: "active",
      label: "Active Jobs",
      count: bookings.filter((b) =>
        ["requested", "accepted", "in-progress"].includes(b.status)
      ).length,
    },
    {
      id: "completed",
      label: "Completed",
      count: bookings.filter((b) => b.status === "completed").length,
    },
    {
      id: "cancelled",
      label: "Cancelled / Rejected",
      count: bookings.filter((b) =>
        ["cancelled", "rejected"].includes(b.status)
      ).length,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        heading="My Repair Bookings"
        description="Monitor status changes, cancel pending requests, and complete Stripe payments."
      >
        <Link href="/services">
          <Button className="bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 shadow-xs">
            <PlusCircle className="size-4" />
            Book a Service
          </Button>
        </Link>
      </PageHeader>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`size-4.5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeTab === tab.id
                  ? "bg-white/25 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings Content */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="You don't have any repair bookings in this category right now."
          actionLabel="Browse Available Services"
          actionHref="/services"
        />
      ) : (
        <Card className="border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Service Details</th>
                  <th className="px-5 py-3.5">Technician</th>
                  <th className="px-5 py-3.5">Preferred Date</th>
                  <th className="px-5 py-3.5">Cost</th>
                  <th className="px-5 py-3.5">Job Status</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => {
                  const isCompleted = booking.status === "completed";
                  const isPaid = booking.paymentStatus === "paid";
                  const isRequested = booking.status === "requested";

                  return (
                    <tr
                      key={booking._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Service Info with thumbnail */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {booking.serviceImage ? (
                              <Image
                                src={booking.serviceImage}
                                alt={booking.serviceTitle}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center bg-teal-50 text-teal-700">
                                <Wrench className="size-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">
                              {booking.serviceTitle}
                            </p>
                            <span className="text-xs text-teal-700 font-medium">
                              {booking.category}
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] truncate">
                              {booking.address}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Technician */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 text-xs">
                          {booking.technicianName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {booking.technicianEmail}
                        </p>
                      </td>

                      {/* Preferred Date */}
                      <td className="px-5 py-4 text-xs font-medium text-slate-600">
                        {formatDate(booking.preferredDate)}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(
                            booking.finalAmount || booking.basePrice
                          )}
                        </span>
                        {booking.finalAmount !== booking.basePrice && (
                          <span className="block text-[10px] text-slate-400 line-through">
                            Base: {formatCurrency(booking.basePrice)}
                          </span>
                        )}
                      </td>

                      {/* Job Status Badge */}
                      <td className="px-5 py-4">
                        <StatusBadge status={booking.status} />
                      </td>

                      {/* Payment Status Badge */}
                      <td className="px-5 py-4">
                        <StatusBadge status={booking.paymentStatus} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Cancel button: ONLY allowed while still requested */}
                          {isRequested && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCancelModalBooking(booking)}
                              className="text-xs h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold"
                            >
                              <XCircle className="size-3.5 mr-1" />
                              Cancel
                            </Button>
                          )}

                          {/* Pay Now Button: ONLY when completed and unpaid */}
                          {isCompleted && !isPaid && (
                            <Button
                              size="sm"
                              onClick={() => handlePayNow(booking)}
                              className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1 shadow-xs"
                            >
                              <CreditCard className="size-3.5" />
                              Pay Now
                            </Button>
                          )}

                          {/* Paid confirmation pill */}
                          {isPaid && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <Check className="size-3.5" />
                              Settled
                            </span>
                          )}

                          {/* In-progress status cue */}
                          {booking.status === "in-progress" && (
                            <span className="text-xs text-amber-700 font-medium">
                              In Service...
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Confirmation Modal for Booking Cancellation */}
      <ConfirmDialog
        isOpen={!!cancelModalBooking}
        onClose={() => setCancelModalBooking(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Repair Request?"
        description={`Are you sure you want to cancel your repair request for "${cancelModalBooking?.serviceTitle}"? This action cannot be undone.`}
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Booking"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
