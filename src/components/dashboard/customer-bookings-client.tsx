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
import { Booking } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { ApiError } from "@/lib/api";
import {
  cancelBooking,
  getMyBookings,
  startCheckout,
} from "@/lib/action/api/customerApi";
import { useCurrentUser } from "@/lib/session";
import {
  CreditCard,
  XCircle,
  PlusCircle,
  Check,
  Wrench,
  AlertCircle,
} from "lucide-react";

const ACTIVE_STATUSES = ["requested", "accepted", "in-progress"];

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

export function CustomerBookingsClient() {
  const { user, isPending } = useCurrentUser();

  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loadState, setLoadState] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [reloadKey, setReloadKey] = React.useState(0);

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [cancelModalBooking, setCancelModalBooking] =
    React.useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [payingId, setPayingId] = React.useState<string | null>(null);

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
        console.error("Failed to load bookings:", error);
        setLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [isPending, user?._id, user?.role, reloadKey]);

  const refresh = () => setReloadKey((key) => key + 1);

  const handleRetry = () => {
    setLoadState("loading");
    refresh();
  };

  const isLoading = isPending || loadState === "loading";

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return ACTIVE_STATUSES.includes(booking.status);
    if (activeTab === "completed") return booking.status === "completed";
    if (activeTab === "cancelled")
      return ["cancelled", "rejected"].includes(booking.status);
    return booking.status === activeTab;
  });

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;

    setIsCancelling(true);

    try {
      await cancelBooking(cancelModalBooking._id);
      toast.success("Booking cancelled successfully.");
      setCancelModalBooking(null);
      refresh();
    } catch (error) {
      // The server is the source of truth: re-sync so a stale row disappears.
      toast.error(errorMessage(error, "Failed to cancel the booking."));
      setCancelModalBooking(null);
      refresh();
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePayNow = async (booking: Booking) => {
    setPayingId(booking._id);

    try {
      const { url } = await startCheckout(booking._id);

      if (!url) {
        throw new Error("Stripe did not return a checkout URL.");
      }

      window.location.assign(url);
    } catch (error) {
      toast.error(
        errorMessage(error, "Could not start the payment. Please try again.")
      );
      setPayingId(null);
    }
  };

  const tabs = [
    { id: "all", label: "All Bookings", count: bookings.length },
    {
      id: "active",
      label: "Active Jobs",
      count: bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length,
    },
    {
      id: "completed",
      label: "Completed",
      count: bookings.filter((b) => b.status === "completed").length,
    },
    {
      id: "cancelled",
      label: "Cancelled / Rejected",
      count: bookings.filter((b) => ["cancelled", "rejected"].includes(b.status))
        .length,
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

      {isLoading ? (
        <BookingsSkeleton />
      ) : loadState === "error" ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load your bookings"
          description="We could not reach the repair service server. Check your connection and try again."
          actionLabel="Try Again"
          onAction={handleRetry}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={activeTab === tab.id}
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

          {filteredBookings.length === 0 ? (
            <EmptyState
              title="No bookings found"
              description={
                bookings.length === 0
                  ? "You have not requested a repair yet. Browse available services to get started."
                  : "You don't have any repair bookings in this category right now."
              }
              actionLabel="Browse Available Services"
              actionHref="/services"
            />
          ) : (
            <>
              {/* Desktop table */}
              <Card className="hidden md:block border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Service Details</th>
                        <th className="px-5 py-3.5">Technician</th>
                        <th className="px-5 py-3.5">Preferred Date</th>
                        <th className="px-5 py-3.5">Amount</th>
                        <th className="px-5 py-3.5">Job Status</th>
                        <th className="px-5 py-3.5">Payment</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredBookings.map((booking) => (
                        <tr
                          key={booking._id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative size-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                {booking.serviceImage ? (
                                  <Image
                                    src={booking.serviceImage}
                                    alt={booking.serviceTitle}
                                    fill
                                    sizes="48px"
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

                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800 text-xs">
                              {booking.technicianName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {booking.technicianEmail}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-xs font-medium text-slate-600">
                            {formatDate(booking.preferredDate)}
                          </td>

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

                          <td className="px-5 py-4">
                            <StatusBadge status={booking.status} />
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={booking.paymentStatus} />
                          </td>

                          <td className="px-5 py-4 text-right">
                            <BookingActions
                              booking={booking}
                              payingId={payingId}
                              onCancel={setCancelModalBooking}
                              onPay={handlePayNow}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filteredBookings.map((booking) => (
                  <Card
                    key={booking._id}
                    className="border border-slate-200/90 shadow-xs p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative size-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        {booking.serviceImage ? (
                          <Image
                            src={booking.serviceImage}
                            alt={booking.serviceTitle}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-teal-50 text-teal-700">
                            <Wrench className="size-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-sm leading-snug">
                          {booking.serviceTitle}
                        </p>
                        <p className="text-xs text-teal-700 font-medium">
                          {booking.category}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {booking.technicianName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-slate-400">Preferred date</span>
                        <span className="font-medium text-slate-700">
                          {formatDate(booking.preferredDate)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400">Amount</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(
                            booking.finalAmount || booking.basePrice
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={booking.status} />
                      <StatusBadge status={booking.paymentStatus} />
                    </div>

                    <p className="text-xs text-slate-500 truncate">
                      {booking.address}
                    </p>

                    <BookingActions
                      booking={booking}
                      payingId={payingId}
                      onCancel={setCancelModalBooking}
                      onPay={handlePayNow}
                      fullWidth
                    />
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!cancelModalBooking}
        onClose={() => setCancelModalBooking(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Repair Request?"
        description={`Are you sure you want to cancel your repair request for "${cancelModalBooking?.serviceTitle}"? This action cannot be undone.`}
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Booking"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
}

interface BookingActionsProps {
  booking: Booking;
  payingId: string | null;
  onCancel: (booking: Booking) => void;
  onPay: (booking: Booking) => void;
  fullWidth?: boolean;
}

function BookingActions({
  booking,
  payingId,
  onCancel,
  onPay,
  fullWidth,
}: BookingActionsProps) {
  const isRequested = booking.status === "requested";
  const isCompleted = booking.status === "completed";
  const isPaid = booking.paymentStatus === "paid";

  return (
    <div
      className={`flex items-center gap-2 ${
        fullWidth ? "justify-start" : "justify-end"
      }`}
    >
      {isRequested && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCancel(booking)}
          className="text-xs h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold"
        >
          <XCircle className="size-3.5 mr-1" />
          Cancel
        </Button>
      )}

      {isCompleted && !isPaid && (
        <Button
          size="sm"
          onClick={() => onPay(booking)}
          disabled={payingId === booking._id}
          className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1 shadow-xs"
        >
          <CreditCard className="size-3.5" />
          {payingId === booking._id ? "Opening Stripe…" : "Pay Now"}
        </Button>
      )}

      {isPaid && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <Check className="size-3.5" />
          Settled
        </span>
      )}

      {booking.status === "in-progress" && (
        <span className="text-xs text-amber-700 font-medium">In Service…</span>
      )}
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading bookings">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-8 w-24 animate-pulse rounded-full bg-slate-200"
          />
        ))}
      </div>
      <Card className="border border-slate-200 p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 animate-pulse">
            <div className="size-12 shrink-0 rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-slate-200" />
              <div className="h-3 w-1/5 rounded bg-slate-100" />
            </div>
            <div className="h-6 w-20 rounded-full bg-slate-100" />
          </div>
        ))}
      </Card>
    </div>
  );
}
