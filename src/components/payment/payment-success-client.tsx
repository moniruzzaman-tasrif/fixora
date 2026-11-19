"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Payment } from "@/types";
import { formatCurrency } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { verifyPayment } from "@/lib/action/api/customerApi";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Receipt,
  ArrowRight,
} from "lucide-react";

type State =
  | { status: "verifying" }
  | { status: "paid"; payment: Payment }
  | { status: "error"; message: string; needsSignIn?: boolean };

export function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [result, setResult] = React.useState<State | null>(null);

  React.useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    verifyPayment(sessionId)
      .then((data) => {
        if (cancelled) return;
        setResult({ status: "paid", payment: data.payment });
      })
      .catch((error) => {
        if (cancelled) return;
        setResult({
          status: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "We could not verify this payment. Please contact support with your receipt.",
          needsSignIn: error instanceof ApiError && error.status === 401,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Missing session id is derived, never set from inside the effect.
  const state: State = sessionId
    ? result ?? { status: "verifying" }
    : {
        status: "error",
        message: "This payment link is missing its Stripe session reference.",
      };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-lg border border-slate-200 shadow-md rounded-2xl p-8 text-center space-y-5">
          {state.status === "verifying" && (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
                <Loader2 className="size-8 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Verifying your payment…
              </h1>
              <p className="text-sm text-slate-500">
                Please wait while we confirm the transaction with Stripe.
              </p>
            </>
          )}

          {state.status === "paid" && (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="size-8" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Payment successful
              </h1>
              <p className="text-sm text-slate-500">
                Your repair payment has been confirmed. Thank you for using
                Fixora.
              </p>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Service</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {state.payment.serviceTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Technician</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {state.payment.technicianName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Amount paid</span>
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(state.payment.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Transaction ID</span>
                  <code className="text-xs bg-white px-2 py-1 rounded border border-slate-200 font-mono break-all">
                    {state.payment.transactionId}
                  </code>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/dashboard/customer/payments" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full gap-2 font-semibold"
                  >
                    <Receipt className="size-4" />
                    Payment history
                  </Button>
                </Link>
                <Link href="/dashboard/customer/bookings" className="flex-1">
                  <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2">
                    Back to bookings
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}

          {state.status === "error" && (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertCircle className="size-8" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Payment not confirmed
              </h1>
              <p className="text-sm text-slate-500">{state.message}</p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={
                    state.needsSignIn
                      ? "/sign-in?callbackUrl=%2Fdashboard%2Fcustomer%2Fbookings"
                      : "/dashboard/customer/bookings"
                  }
                  className="flex-1"
                >
                  <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold">
                    {state.needsSignIn ? "Sign in to verify" : "Back to bookings"}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
