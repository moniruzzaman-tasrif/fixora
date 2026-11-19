"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Service } from "@/types";
import { formatCurrency } from "@/lib/format";
import { useCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { ApiError } from "@/lib/api";
import { createBooking } from "@/lib/action/api/customerApi";

interface ServiceBookingCardProps {
  service: Service;
}

function getLocalDateInputValue() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

export function ServiceBookingCard({ service }: ServiceBookingCardProps) {
  const router = useRouter();
  const { user, isPending: isSessionPending } = useCurrentUser();
  const today = getLocalDateInputValue();

  const [phoneInput, setPhoneInput] = React.useState<string | null>(null);
  const [addressInput, setAddressInput] = React.useState<string | null>(null);
  const [preferredDate, setPreferredDate] = React.useState("");
  const [problemDescription, setProblemDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [bookingSubmitted, setBookingSubmitted] = React.useState(false);

  // Profile values pre-fill the form until the customer edits them.
  const customerPhone = phoneInput ?? user?.phone ?? "";
  const customerAddress = addressInput ?? "";

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSessionPending) {
      return;
    }

    if (!user) {
      router.push(
        `/sign-in?callbackUrl=${encodeURIComponent(`/services/${service._id}`)}`
      );
      return;
    }

    if (user.role !== "customer") {
      toast.error("Only customers can request a repair");
      return;
    }

    if (!customerPhone.trim() || !customerAddress.trim() || !preferredDate) {
      toast.error("Please fill in all required booking fields.");
      return;
    }

    if (preferredDate < today) {
      toast.error("Please choose today or a future date for the visit.");
      return;
    }

    if (problemDescription.trim().length < 20) {
      toast.error("Problem description must be at least 20 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      // The server owns price, technician, status and payment status; it reads
      // them from the service document and the BetterAuth session.
      await createBooking({
        serviceId: service._id,
        customerPhone,
        address: customerAddress,
        preferredDate,
        problemDescription,
      });

      setBookingSubmitted(true);
      toast.success("Repair request sent successfully.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to send booking request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-6">
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Standard Pricing
          </span>
          <span className="text-2xl font-black text-slate-900">
            {formatCurrency(service.basePrice)}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Payment is requested after the technician marks the repair complete.
        </p>
      </div>

      {/* Role Restriction Check */}
      {user && user.role !== "customer" ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <AlertCircle className="size-4 shrink-0" />
            <span>Booking Restricted</span>
          </div>
          <p>
            Only customers can request a repair. You are signed in as a{" "}
            <strong>{user.role}</strong>.
          </p>
        </div>
      ) : bookingSubmitted ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Your repair request was sent.</p>
          <Link
            href="/dashboard/customer/bookings"
            className="mt-2 inline-flex font-semibold text-teal-800 underline underline-offset-2"
          >
            View My Bookings
          </Link>
        </div>
      ) : (
        <form onSubmit={handleBookingSubmit} noValidate className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Send Repair Request
          </h3>

          {user && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="reqName" className="text-xs font-semibold text-slate-700">
                  Name
                </Label>
                <Input
                  id="reqName"
                  value={user.name}
                  readOnly
                  aria-readonly="true"
                  className="h-10 bg-slate-50 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reqEmail" className="text-xs font-semibold text-slate-700">
                  Email
                </Label>
                <Input
                  id="reqEmail"
                  type="email"
                  value={user.email}
                  readOnly
                  aria-readonly="true"
                  className="h-10 bg-slate-50 text-xs"
                />
              </div>
            </div>
          )}

          {/* Preferred Date */}
          <div className="space-y-1">
            <Label htmlFor="reqDate" className="text-xs font-semibold text-slate-700">
              Preferred Date *
            </Label>
            <Input
              id="reqDate"
              type="date"
              min={today}
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              required
              className="text-xs h-10"
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-1">
            <Label htmlFor="reqPhone" className="text-xs font-semibold text-slate-700">
              Contact Phone *
            </Label>
            <Input
              id="reqPhone"
              type="tel"
              placeholder="e.g. +880 1700-000000"
              value={customerPhone}
              onChange={(e) => setPhoneInput(e.target.value)}
              required
              className="text-xs h-10"
            />
          </div>

          {/* Address */}
          <div className="space-y-1">
            <Label htmlFor="reqAddress" className="text-xs font-semibold text-slate-700">
              Service / Pickup Address *
            </Label>
            <Input
              id="reqAddress"
              type="text"
              placeholder="House, Road, Area (e.g. House 12, Road 4, Mirpur 10)"
              value={customerAddress}
              onChange={(e) => setAddressInput(e.target.value)}
              required
              className="text-xs h-10"
            />
          </div>

          {/* Problem Description */}
          <div className="space-y-1">
            <Label htmlFor="reqDesc" className="text-xs font-semibold text-slate-700">
              Problem Description *
            </Label>
            <textarea
              id="reqDesc"
              rows={3}
              minLength={20}
              placeholder="Describe what's wrong with your device or appliance..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isSessionPending}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold h-11 text-sm shadow-xs"
          >
            {isSessionPending ? (
              "Checking your account…"
            ) : isSubmitting ? (
              "Sending Request…"
            ) : user ? (
              "Confirm & Send Request"
            ) : (
              "Sign In to Request Repair"
            )}
          </Button>

          <p className="text-[11px] text-center text-slate-400">
            🔒 Zero risk. You only pay after your repair is completed and tested.
          </p>
        </form>
      )}
    </Card>
  );
}
