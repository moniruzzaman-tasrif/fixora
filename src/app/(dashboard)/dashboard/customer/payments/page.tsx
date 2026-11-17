"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { DUMMY_PAYMENTS } from "@/data/payments";
import { formatCurrency, formatDate } from "@/lib/format";
import { CreditCard, Receipt, CheckCircle, ExternalLink } from "lucide-react";

export default function CustomerPaymentsPage() {
  // Filter payments for current customer
  // TODO(owner): replace with API call: GET /api/payments/my
  const myPayments = DUMMY_PAYMENTS.filter(
    (p) => p.customerEmail === "rahim.customer@fixora.com"
  );

  const totalSpent = myPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Payment History"
        description="View records and Stripe transaction receipts for all completed repair services."
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total Paid to Technicians"
          value={formatCurrency(totalSpent)}
          subtitle="Processed securely through Stripe Checkout"
          icon={CreditCard}
          iconClassName="bg-teal-50 text-teal-700"
        />
        <StatCard
          title="Completed Transactions"
          value={myPayments.length}
          subtitle="100% pay-after-service guarantee verified"
          icon={Receipt}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Payments Table */}
      {myPayments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payment records found"
          description="You haven't made any payments yet. Payments appear here after a repair job is marked completed and settled."
          actionLabel="View My Bookings"
          actionHref="/dashboard/customer/bookings"
        />
      ) : (
        <Card className="border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Service Repaired</th>
                  <th className="px-5 py-3.5">Technician</th>
                  <th className="px-5 py-3.5">Amount (USD)</th>
                  <th className="px-5 py-3.5">Stripe Transaction ID</th>
                  <th className="px-5 py-3.5">Date Paid</th>
                  <th className="px-5 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {myPayments.map((payment) => (
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
                        Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
