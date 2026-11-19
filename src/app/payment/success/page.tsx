import { Suspense } from "react";
import { PaymentSuccessClient } from "@/components/payment/payment-success-client";

export const metadata = {
  title: "Payment Successful — Fixora",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-sm font-semibold text-teal-800 animate-pulse">
            Loading payment status…
          </p>
        </div>
      }
    >
      <PaymentSuccessClient />
    </Suspense>
  );
}
