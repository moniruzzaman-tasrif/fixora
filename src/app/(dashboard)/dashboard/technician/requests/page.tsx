"use client";

import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Booking } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { useAccessibleDialog } from "@/lib/use-accessible-dialog";
import {
  getTechnicianBookings,
  updateBookingStatus,
} from "@/lib/action/api/technicianApi";
import { useCurrentUser } from "@/lib/session";
import {
  Check,
  XCircle,
  Play,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  X,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export default function TechnicianRequestsPage() {
  const { user, isPending } = useCurrentUser();
  const [requests, setRequests] = React.useState<Booking[]>([]);
  const [loadState, setLoadState] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [loadError, setLoadError] = React.useState("");
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (isPending || user?.role !== "technician") return;

    let cancelled = false;

    async function load() {
      setLoadState("loading");
      try {
        const data = await getTechnicianBookings();
        if (cancelled) return;
        setRequests(data);
        setLoadState("ready");
      } catch (err: unknown) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "We could not load your job requests. Please try again."
        );
        setLoadState("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isPending, user?._id, user?.role, reloadKey]);

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [rejectModalBooking, setRejectModalBooking] =
    React.useState<Booking | null>(null);
  const [completeModalBooking, setCompleteModalBooking] =
    React.useState<Booking | null>(null);
  const [finalAmountInput, setFinalAmountInput] = React.useState<string>("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [busyBookingId, setBusyBookingId] = React.useState<string | null>(null);
  const { dialogRef: completeDialogRef, onKeyDown: onCompleteDialogKeyDown } =
    useAccessibleDialog<HTMLDivElement>(
      Boolean(completeModalBooking),
      () => setCompleteModalBooking(null),
      !isProcessing
    );

  const filteredRequests = requests.filter((request) => {
    if (activeTab === "all") return true;
    return request.status === activeTab;
  });

  const applyBooking = (updated: Booking) => {
    setRequests((prev) =>
      prev.map((row) =>
        row._id === updated._id ? { ...row, ...updated } : row
      )
    );
  };

  const runTransition = async (
    booking: Booking,
    status: Booking["status"],
    successMessage: string,
    finalAmount?: number
  ) => {
    setBusyBookingId(booking._id);
    try {
      const updated = await updateBookingStatus(
        booking._id,
        status,
        finalAmount
      );
      applyBooking(updated);
      toast.success(successMessage);
      return true;
    } catch (err: unknown) {
      toast.error(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Could not update the booking."
      );
      return false;
    } finally {
      setBusyBookingId(null);
    }
  };

  const handleAccept = (booking: Booking) =>
    runTransition(
      booking,
      "accepted",
      `Accepted the repair request from ${booking.customerName}.`
    );

  const handleConfirmReject = async () => {
    if (!rejectModalBooking) return;
    setIsProcessing(true);
    const ok = await runTransition(
      rejectModalBooking,
      "rejected",
      "Job request rejected."
    );
    if (ok) setRejectModalBooking(null);
    setIsProcessing(false);
  };

  const handleStartWork = (booking: Booking) =>
    runTransition(
      booking,
      "in-progress",
      `Work started on "${booking.serviceTitle}".`
    );

  const openCompleteModal = (booking: Booking) => {
    setCompleteModalBooking(booking);
    setFinalAmountInput(
      (booking.finalAmount || booking.basePrice).toString()
    );
  };

  const handleConfirmComplete = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!completeModalBooking) return;

    const amount = Number(finalAmountInput);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Final amount must be a number greater than 0.");
      return;
    }

    setIsProcessing(true);
    const ok = await runTransition(
      completeModalBooking,
      "completed",
      `Job completed. Final amount ${formatCurrency(amount)} is now payable by the customer.`,
      amount
    );
    if (ok) setCompleteModalBooking(null);
    setIsProcessing(false);
  };

  const tabs = [
    { id: "all", label: "All", count: requests.length },
    {
      id: "requested",
      label: "Requested",
      count: requests.filter((r) => r.status === "requested").length,
    },
    {
      id: "accepted",
      label: "Accepted",
      count: requests.filter((r) => r.status === "accepted").length,
    },
    {
      id: "in-progress",
      label: "In Progress",
      count: requests.filter((r) => r.status === "in-progress").length,
    },
    {
      id: "completed",
      label: "Completed",
      count: requests.filter((r) => r.status === "completed").length,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Manage Service Requests"
        description="Advance jobs through the enforced status pipeline: Requested → Accepted → In Progress → Completed."
      />

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

      {loadState === "loading" ? (
        <div role="status" aria-label="Loading requests" className="space-y-3">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : loadState === "error" ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load job requests"
          description={loadError}
          actionLabel="Try Again"
          onAction={() => setReloadKey((key) => key + 1)}
        />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title="No requests in this view"
          description="You don't have any customer requests matching this status filter."
        />
      ) : (
        <Card className="border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Customer & Contact</th>
                  <th className="px-5 py-3.5">Service & Amount</th>
                  <th className="px-5 py-3.5">Preferred Schedule</th>
                  <th className="px-5 py-3.5">Problem Description</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Allowed Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 text-sm">
                        {request.customerName}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Phone className="size-3" />
                        <span>{request.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 max-w-[200px] truncate">
                        <MapPin className="size-3 shrink-0" />
                        <span>{request.address}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 text-xs">
                        {request.serviceTitle}
                      </p>
                      <span className="text-[11px] text-teal-700 font-medium">
                        {request.category}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Base: {formatCurrency(request.basePrice)}
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        Final: {formatCurrency(request.finalAmount || request.basePrice)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3.5 text-slate-400" />
                        <span>{formatDate(request.preferredDate)}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-600 max-w-xs">
                      <p className="line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        &quot;{request.problemDescription}&quot;
                      </p>
                    </td>

                    <td className="px-5 py-4 space-y-1">
                      <StatusBadge status={request.status} />
                      {request.status === "completed" && (
                        <div>
                          <StatusBadge status={request.paymentStatus} />
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {request.status === "requested" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAccept(request)}
                              disabled={busyBookingId === request._id}
                              className="text-xs h-8 bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-1 shadow-xs"
                            >
                              <Check className="size-3.5" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRejectModalBooking(request)}
                              disabled={busyBookingId === request._id}
                              className="text-xs h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold"
                            >
                              <XCircle className="size-3.5" />
                              Reject
                            </Button>
                          </>
                        )}

                        {request.status === "accepted" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartWork(request)}
                            disabled={busyBookingId === request._id}
                            className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1 shadow-xs"
                          >
                            <Play className="size-3.5" />
                            Start Work
                          </Button>
                        )}

                        {request.status === "in-progress" && (
                          <Button
                            size="sm"
                            onClick={() => openCompleteModal(request)}
                            disabled={busyBookingId === request._id}
                            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Mark Completed
                          </Button>
                        )}

                        {request.status === "completed" && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                            <CreditCard className="size-3.5" />
                            {request.paymentStatus === "paid"
                              ? "Paid by customer"
                              : "Awaiting payment"}
                          </span>
                        )}

                        {["rejected", "cancelled"].includes(request.status) && (
                          <span className="text-xs text-slate-400 italic">
                            Closed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmDialog
        isOpen={!!rejectModalBooking}
        onClose={() => setRejectModalBooking(null)}
        onConfirm={handleConfirmReject}
        title="Reject Repair Request?"
        description={`Are you sure you want to decline the request for "${rejectModalBooking?.serviceTitle}" from ${rejectModalBooking?.customerName}? This cannot be undone.`}
        confirmLabel="Yes, Reject Request"
        cancelLabel="Go Back"
        variant="danger"
        isLoading={isProcessing}
      />

      {completeModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            ref={completeDialogRef}
            onKeyDown={onCompleteDialogKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="complete-job-dialog-title"
            aria-describedby="complete-job-dialog-description"
            tabIndex={-1}
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 id="complete-job-dialog-title" className="text-lg font-bold text-slate-900">
                Mark Job Completed
              </h3>
              <button
                type="button"
                onClick={() => setCompleteModalBooking(null)}
                disabled={isProcessing}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmComplete} className="space-y-4">
              <p id="complete-job-dialog-description" className="text-xs text-slate-600">
                Job: <strong>{completeModalBooking.serviceTitle}</strong> for{" "}
                <strong>{completeModalBooking.customerName}</strong>.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="finalAmount">
                  Final Amount to Bill (USD){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="finalAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={finalAmountInput}
                  onChange={(e) => setFinalAmountInput(e.target.value)}
                  placeholder="e.g. 50"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Pre-filled with the base price (
                  {formatCurrency(completeModalBooking.basePrice)}). Adjust only if
                  additional parts or labor were required.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs">
                ✓ Once confirmed, a <strong>Pay Now</strong> button appears on the
                customer&apos;s dashboard to pay through Stripe.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCompleteModalBooking(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isProcessing ? "Saving..." : "Confirm & Complete Job"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
