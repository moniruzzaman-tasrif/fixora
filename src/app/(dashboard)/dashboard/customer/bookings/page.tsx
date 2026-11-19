import { Suspense } from "react";
import getBooking from "@/lib/action/dataGet/getBooking";
import { CustomerBookingsClient } from "@/components/dashboard/customer-bookings-client";
import { Card } from "@/components/ui/card";

async function BookingsLoader() {
  const data = await getBooking();

  return (
    <CustomerBookingsClient
      initialBookings={Array.isArray(data) ? data : []}
    />
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-slate-200" />
        <div className="h-4 w-96 rounded bg-slate-100" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-24 rounded-full bg-slate-200" />
        <div className="h-8 w-24 rounded-full bg-slate-100" />
        <div className="h-8 w-24 rounded-full bg-slate-100" />
      </div>
      <Card className="border border-slate-200 p-6 space-y-4">
        <div className="h-6 w-full rounded bg-slate-100" />
        <div className="h-12 w-full rounded bg-slate-50" />
        <div className="h-12 w-full rounded bg-slate-50" />
        <div className="h-12 w-full rounded bg-slate-50" />
      </Card>
    </div>
  );
}

export default function CustomerBookingsPage() {
  return (
    <Suspense fallback={<BookingsSkeleton />}>
      <BookingsLoader />
    </Suspense>
  );
}
