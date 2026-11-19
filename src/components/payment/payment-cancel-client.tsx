"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, ArrowRight } from "lucide-react";

export function PaymentCancelClient() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-lg border border-slate-200 shadow-md rounded-2xl p-8 text-center space-y-5">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
            <XCircle className="size-8" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Payment cancelled</h1>
          <p className="text-sm text-slate-500">
            You closed the Stripe checkout before completing the payment. Your
            repair booking is unchanged and still awaiting payment.
          </p>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
            <p className="text-xs text-amber-800 leading-relaxed">
              No money was taken. You can return to your bookings and press
              <strong> Pay Now</strong> whenever you are ready — the amount is the
              final amount your technician set when the job was completed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/dashboard/customer/payments" className="flex-1">
              <Button variant="outline" className="w-full font-semibold">
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
        </Card>
      </main>

      <Footer />
    </div>
  );
}
