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
import { DUMMY_BOOKINGS } from "@/data/bookings";
import { Booking, BookingStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
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
} from "lucide-react";

export default function TechnicianRequestsPage() {
  // TODO(owner): replace with API call: GET /api/bookings/technician
  const [requests, setRequests] = React.useState<Booking[]>(() =>
    DUMMY_BOOKINGS.filter((b) => b.technicianEmail === "tanvir.tech@fixora.com")
  );

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [rejectModalBooking, setRejectModalBooking] = React.useState<Booking | null>(null);
  const [completeModalBooking, setCompleteModalBooking] = React.useState<Booking | null>(null);
  const [finalAmountInput, setFinalAmountInput] = React.useState<string>("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "all") return true;
    return r.status === activeTab;
  });

  // Action: Accept Request (requested -> accepted)
  const handleAccept = async (booking: Booking) => {
    try {
      // TODO(owner): call PATCH /api/bookings/:id/status { status: 'accepted' }
      setRequests((prev) =>
        prev.map((b) =>
          b._id === booking._id ? { ...b, status: "accepted" as BookingStatus } : b
        )
      );
      toast.success(`Accepted repair request for ${booking.customerName}.`);
    } catch {
      toast.error("Failed to accept request.");
    }
  };

  // Action: Confirm Reject Request (requested -> rejected)
  const handleConfirmReject = async () => {
    if (!rejectModalBooking) return;
    setIsProcessing(true);

    try {
      // TODO(owner): call PATCH /api/bookings/:id/status { status: 'rejected' }
      setRequests((prev) =>
        prev.map((b) =>
          b._id === rejectModalBooking._id
            ? { ...b, status: "rejected" as BookingStatus }
            : b
        )
      );
      toast.success("Job request rejected.");
      setRejectModalBooking(null);
    } catch {
      toast.error("Failed to reject request.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Action: Start Work (accepted -> in-progress)
  const handleStartWork = async (booking: Booking) => {
    try {
      // TODO(owner): call PATCH /api/bookings/:id/status { status: 'in-progress' }
      setRequests((prev) =>
        prev.map((b) =>
          b._id === booking._id
            ? { ...b, status: "in-progress" as BookingStatus }
            : b
        )
      );
      toast.info(`Work started on "${booking.serviceTitle}". Status updated to In Progress.`);
    } catch {
      toast.error("Failed to start job.");
    }
  };

  // Open Complete Modal (in-progress -> completed)
  const openCompleteModal = (booking: Booking) => {
    setCompleteModalBooking(booking);
    setFinalAmountInput((booking.finalAmount || booking.basePrice).toString());
  };

  // Action: Confirm Mark Completed with Final Amount
  const handleConfirmComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalBooking) return;

    const amountNum = parseFloat(finalAmountInput);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Final amount must be a number greater than 0.");
      return;
    }

    setIsProcessing(true);

    try {
      // TODO(owner): call PATCH /api/bookings/:id/status { status: 'completed', finalAmount: amountNum }
      await new Promise((resolve) => setTimeout(resolve, 600));

      setRequests((prev) =>
        prev.map((b) =>
          b._id === completeModalBooking._id
            ? {
                ...b,
                status: "completed" as BookingStatus,
                finalAmount: amountNum,
                paymentStatus: "unpaid",
              }
            : b
        )
      );

      toast.success(
        `Job marked completed! Final amount set to ${formatCurrency(amountNum)}. Customer can now pay via Stripe.`
      );
      setCompleteModalBooking(null);
    } catch {
      toast.error("Failed to mark completed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    { id: "all", label: "All Requests", count: requests.length },
    {
      id: "requested",
      label: "Pending",
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
        description="Advance jobs through the strictly enforced status pipeline: Requested → Accepted → In Progress → Completed."
      />

      {/* Status Filter Tabs */}
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

      {filteredRequests.length === 0 ? (
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
                  <th className="px-5 py-3.5">Service Requested</th>
                  <th className="px-5 py-3.5">Preferred Schedule</th>
                  <th className="px-5 py-3.5">Problem Description</th>
                  <th className="px-5 py-3.5">Pipeline Status</th>
                  <th className="px-5 py-3.5 text-right">Allowed Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Customer */}
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

                    {/* Service */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 text-xs">
                        {request.serviceTitle}
                      </p>
                      <span className="text-[11px] text-teal-700 font-medium">
                        {request.category}
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-1">
                        Amount:{" "}
                        {formatCurrency(request.finalAmount || request.basePrice)}
                      </p>
                    </td>

                    {/* Preferred Date */}
                    <td className="px-5 py-4 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3.5 text-slate-400" />
                        <span>{formatDate(request.preferredDate)}</span>
                      </div>
                    </td>

                    {/* Problem Description */}
                    <td className="px-5 py-4 text-xs text-slate-600 max-w-xs">
                      <p className="line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        &quot;{request.problemDescription}&quot;
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={request.status} />
                    </td>

                    {/* Actions: ONLY valid transitions per assignment rules */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Status === 'requested' -> Accept or Reject */}
                        {request.status === "requested" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAccept(request)}
                              className="text-xs h-8 bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-1 shadow-xs"
                            >
                              <Check className="size-3.5" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRejectModalBooking(request)}
                              className="text-xs h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold"
                            >
                              <XCircle className="size-3.5" />
                              Reject
                            </Button>
                          </>
                        )}

                        {/* Status === 'accepted' -> Start Work */}
                        {request.status === "accepted" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartWork(request)}
                            className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1 shadow-xs"
                          >
                            <Play className="size-3.5" />
                            Start Work
                          </Button>
                        )}

                        {/* Status === 'in-progress' -> Mark Completed */}
                        {request.status === "in-progress" && (
                          <Button
                            size="sm"
                            onClick={() => openCompleteModal(request)}
                            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Mark Completed
                          </Button>
                        )}

                        {/* Status === 'completed' -> Show Payment Status */}
                        {request.status === "completed" && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                            <CreditCard className="size-3.5" />
                            {request.paymentStatus === "paid" ? "Paid" : "Awaiting Payment"}
                          </span>
                        )}

                        {/* Final statuses (rejected, cancelled) -> No action */}
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

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!rejectModalBooking}
        onClose={() => setRejectModalBooking(null)}
        onConfirm={handleConfirmReject}
        title="Reject Repair Request?"
        description={`Are you sure you want to decline the request for "${rejectModalBooking?.serviceTitle}" from ${rejectModalBooking?.customerName}? This will notify the customer.`}
        confirmLabel="Yes, Reject Request"
        cancelLabel="Go Back"
        variant="danger"
        isLoading={isProcessing}
      />

      {/* Mark Completed Modal with Final Amount Input */}
      {completeModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Mark Job Completed
              </h3>
              <button
                type="button"
                onClick={() => setCompleteModalBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmComplete} className="space-y-4">
              <p className="text-xs text-slate-600">
                Job: <strong>{completeModalBooking.serviceTitle}</strong> for{" "}
                <strong>{completeModalBooking.customerName}</strong>.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="finalAmount">
                  Final Amount to Bill (USD) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="finalAmount"
                  type="number"
                  step="0.01"
                  min="1"
                  value={finalAmountInput}
                  onChange={(e) => setFinalAmountInput(e.target.value)}
                  placeholder="e.g. 50"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Pre-filled with base price (${completeModalBooking.basePrice}). Adjust
                  only if additional parts or labor were required.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs">
                ✓ Once confirmed, a <strong>Pay Now</strong> button will appear on the
                customer&apos;s dashboard to complete payment via Stripe.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCompleteModalBooking(null)}
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
