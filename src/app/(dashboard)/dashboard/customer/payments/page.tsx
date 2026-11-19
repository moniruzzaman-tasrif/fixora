"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Payment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { getMyPayments } from "@/lib/action/api/customerApi";
import { useCurrentUser } from "@/lib/session";
import {
  CreditCard,
  Receipt,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function CustomerPaymentsPage() {
  const { user, isPending } = useCurrentUser();

  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loadState, setLoadState] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (isPending || user?.role !== "customer" || !user._id) return;

    let cancelled = false;

    getMyPayments()
      .then((data) => {
        if (cancelled) return;
        // Newest first, even if the API order changes later.
        const sorted = Array.isArray(data)
          ? [...data].sort(
              (a, b) =>
                new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
            )
          : [];
        setPayments(sorted);
        setLoadState("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load payments:", error);
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
  const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Payment History"
        description="View payment records for completed repair services."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={isLoading}
          className="gap-2 font-semibold"
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </PageHeader>

      {isLoading ? (
        <PaymentsSkeleton />
      ) : loadState === "error" ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load your payments"
          description="We could not reach the repair service server. Check your connection and try again."
          actionLabel="Try Again"
          onAction={handleRetry}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              title="Total Paid to Technicians"
              value={formatCurrency(totalSpent)}
              subtitle="Total of recorded payments"
              icon={CreditCard}
              iconClassName="bg-teal-50 text-teal-700"
            />
            <StatCard
              title="Completed Transactions"
              value={payments.length}
              subtitle="Payments recorded for your account"
              icon={Receipt}
              iconClassName="bg-emerald-50 text-emerald-600"
            />
          </div>

          {payments.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No payment records found"
              description="You haven't made any payments yet. Payments appear here after a repair job is marked completed and settled."
              actionLabel="View My Bookings"
              actionHref="/dashboard/customer/bookings"
            />
          ) : (
            <>
              {/* Desktop table */}
              <Card className="hidden md:block border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Service Repaired</th>
                        <th className="px-5 py-3.5">Technician</th>
                        <th className="px-5 py-3.5">Amount (USD)</th>
                        <th className="px-5 py-3.5">Stripe Transaction ID</th>
                        <th className="px-5 py-3.5">Date Paid</th>
                        <th className="px-5 py-3.5 text-right">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {payments.map((payment) => (
                        <tr
                          key={payment._id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="px-5 py-4 font-bold text-slate-900">
                            {payment.serviceTitle}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800 text-xs">
                              {payment.technicianName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {payment.technicianEmail}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm font-bold text-emerald-700">
                            {formatCurrency(payment.amount)}
                          </td>

                          <td className="px-5 py-4">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono">
                              {payment.transactionId}
                            </code>
                          </td>

                          <td className="px-5 py-4 text-xs font-medium text-slate-600">
                            {formatDate(payment.paidAt)}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle className="size-3.5" />
                              Paid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {payments.map((payment) => (
                  <Card
                    key={payment._id}
                    className="border border-slate-200/90 shadow-xs"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm leading-snug">
                            {payment.serviceTitle}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {payment.technicianName}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          <CheckCircle className="size-3" />
                          Paid
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Amount</span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Paid on</span>
                        <span className="font-medium text-slate-600">
                          {formatDate(payment.paidAt)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-xs text-slate-400">
                          Transaction ID
                        </span>
                        <code className="block text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono break-all">
                          {payment.transactionId}
                        </code>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function PaymentsSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading payments">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <Card className="border border-slate-200 p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 animate-pulse">
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
