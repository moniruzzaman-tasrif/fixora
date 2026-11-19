"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Payment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { getAdminPayments } from "@/lib/action/api/adminApi";
import { toast } from "sonner";
import {
  Receipt,
  Search,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Copy,
  Check,
  X,
  DollarSign,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function AdminTransactionsPage() {
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loadState, setLoadState] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [loadError, setLoadError] = React.useState("");
  const [reloadKey, setReloadKey] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState("loading");
      try {
        const data = await getAdminPayments();
        if (cancelled) return;
        setPayments(
          (Array.isArray(data) ? data : []).filter(
            (payment) => payment.paymentStatus === "paid"
          )
        );
        setLoadState("ready");
      } catch (err: unknown) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "Could not load transactions. Please try again."
        );
        setLoadState("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Platform metrics — settled revenue only
  const totalVolume = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalCount = payments.length;
  const averageTicket = totalCount > 0 ? Math.round(totalVolume / totalCount) : 0;

  // Search filter
  const filteredPayments = React.useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        p.transactionId.toLowerCase().includes(q) ||
        p.serviceTitle.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.customerEmail.toLowerCase().includes(q) ||
        p.technicianName.toLowerCase().includes(q)
      );
    });
  }, [payments, searchQuery]);

  const handleCopyTransactionId = (txId: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedId(txId);
    toast.success("Transaction ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        heading="Transactions & Revenue"
        description="Review all customer payments settled through Stripe and platform revenue logs."
      >
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-semibold gap-1 text-xs px-3 py-1">
            <ShieldCheck className="size-3.5 text-emerald-700" />
            Stripe Connected
          </Badge>
        </div>
      </PageHeader>

      {loadState === "loading" ? (
        <div className="space-y-4" role="status" aria-label="Loading transactions">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      ) : loadState === "error" ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load transactions"
          description={loadError}
          actionLabel="Try Again"
          onAction={() => setReloadKey((key) => key + 1)}
        />
      ) : (
        <>
      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Settled Revenue"
          value={formatCurrency(totalVolume)}
          subtitle="Gross payments collected"
          icon={TrendingUp}
          iconClassName="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          title="Completed Transactions"
          value={totalCount}
          subtitle="100% success rate on Stripe"
          icon={Receipt}
          iconClassName="bg-teal-50 text-teal-700"
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(averageTicket)}
          subtitle="Average customer repair spend"
          icon={DollarSign}
          iconClassName="bg-indigo-50 text-indigo-700"
        />
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search by Stripe ID, customer, technician, service..."
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

        <p className="text-xs text-slate-500 self-end sm:self-center">
          Showing <span className="font-semibold text-slate-800">{filteredPayments.length}</span> of{" "}
          <span className="font-semibold text-slate-800">{payments.length}</span> settled payments
        </p>
      </div>

      {/* Transactions Table */}
      <Card className="border-slate-200 shadow-xs bg-white overflow-hidden">
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions found"
              description="No payments matched your search query."
              actionLabel="Clear Search"
              onAction={() => setSearchQuery("")}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Stripe Transaction ID</th>
                    <th scope="col" className="px-6 py-3.5">Service</th>
                    <th scope="col" className="px-6 py-3.5">Customer</th>
                    <th scope="col" className="px-6 py-3.5">Technician</th>
                    <th scope="col" className="px-6 py-3.5">Settled Amount</th>
                    <th scope="col" className="px-6 py-3.5">Paid Date</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Stripe Transaction ID with copy */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800">
                          <CreditCard className="size-3.5 text-teal-600 shrink-0" />
                          <span className="truncate max-w-[140px] sm:max-w-[180px]">
                            {p.transactionId}
                          </span>
                          <button
                            onClick={() => handleCopyTransactionId(p.transactionId)}
                            title="Copy Transaction ID"
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                          >
                            {copiedId === p.transactionId ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: #{p._id.slice(-6).toUpperCase()}
                        </p>
                      </td>

                      {/* Service Title */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 text-xs max-w-xs truncate">
                          {p.serviceTitle}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Ref: #{p.bookingId.slice(-6).toUpperCase()}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 text-xs">
                        <p className="font-semibold text-slate-900">{p.customerName}</p>
                        <p className="text-slate-500 truncate max-w-xs">{p.customerEmail}</p>
                      </td>

                      {/* Technician */}
                      <td className="px-6 py-4 text-xs">
                        <p className="font-semibold text-slate-900">{p.technicianName}</p>
                        <p className="text-slate-500 truncate max-w-xs">{p.technicianEmail}</p>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900 text-sm">
                          {formatCurrency(p.amount)}
                        </p>
                        <span className="text-[10px] font-semibold uppercase text-slate-400">
                          {p.currency}
                        </span>
                      </td>

                      {/* Paid Date */}
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(p.paidAt)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          Settled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
