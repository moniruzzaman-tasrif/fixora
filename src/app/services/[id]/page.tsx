"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Service } from "@/types";
import { formatCurrency } from "@/lib/format";
import getService from "@/lib/action/dataGet/getService";
import { useCurrentUser } from "@/lib/session";
import { toast } from "sonner";
import {
  Wrench,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Home,
  Store,
  ChevronLeft,
  Calendar,
  AlertCircle,
  Sparkles,
  Phone,
  User,
} from "lucide-react";

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;

  const { user } = useCurrentUser();

  const [service, setService] = React.useState<Service | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Booking Form State
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [customerAddress, setCustomerAddress] = React.useState("");
  const [preferredDate, setPreferredDate] = React.useState("");
  const [problemDescription, setProblemDescription] = React.useState("");

  // Pre-fill user profile info if logged in
  React.useEffect(() => {
    if (user?.phone) setCustomerPhone(user.phone);
    if (user?.area) setCustomerAddress(user.area);
  }, [user]);

  // Load service by ID
  React.useEffect(() => {
    let cancelled = false;

    async function loadService() {
      setIsLoading(true);
      try {
        const data = await getService();
        if (cancelled) return;

        const allServices: Service[] = Array.isArray(data) ? data : [];
        const found = allServices.find((s) => s._id === serviceId);
        setService(found || null);
      } catch (err) {
        console.warn("Could not fetch service details from database:", err);
        if (cancelled) return;
        setService(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (serviceId) {
      loadService();
    }

    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push(`/sign-in?redirect=/services/${serviceId}`);
      return;
    }

    if (user.role !== "customer") {
      toast.error("Only registered customers can send repair requests.");
      return;
    }

    if (!preferredDate || !problemDescription.trim() || !customerAddress.trim()) {
      toast.error("Please fill in all required booking fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulation / Seam for backend POST /api/bookings
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success(
        "Repair request sent! The technician will review and update the status shortly."
      );
      router.push("/dashboard/customer/bookings");
    } catch {
      toast.error("Failed to send booking request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <div className="size-10 rounded-full bg-teal-200" />
            <p className="text-sm font-semibold text-slate-600">
              Loading service details…
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-24 text-center">
          <div className="size-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <AlertCircle className="size-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Service Not Found
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            The repair service you requested may have been removed or is temporarily unavailable.
          </p>
          <Link href="/services">
            <Button className="bg-teal-700 hover:bg-teal-800 text-white font-semibold">
              <ChevronLeft className="size-4 mr-1.5" />
              Back to Browse Services
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isHomeVisit = service.serviceMode === "Home Visit";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-slate-200/80 py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-teal-700">Home</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-teal-700">Services</Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold truncate max-w-xs">
                {service.title}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left 7 cols: Service Media, Specs, Description */}
            <div className="lg:col-span-7 space-y-8">
              {/* Image Banner */}
              <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-teal-50 text-teal-700">
                    <Wrench className="size-16" />
                  </div>
                )}

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-900 shadow-xs backdrop-blur-xs">
                    {service.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-xs ${
                      isHomeVisit ? "bg-teal-700" : "bg-slate-900"
                    }`}
                  >
                    {isHomeVisit ? <Home className="size-3" /> : <Store className="size-3" />}
                    <span>{service.serviceMode}</span>
                  </span>
                </div>
              </div>

              {/* Title & Key Highlights */}
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                  {service.title}
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Clock className="size-4 text-teal-700" />
                      <span>Duration</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">
                      {service.estimatedDuration}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <MapPin className="size-4 text-teal-700" />
                      <span>Coverage Area</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {service.serviceArea}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <ShieldCheck className="size-4 text-teal-700" />
                      <span>Warranty</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">
                      30-Day Guaranteed
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Description */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Service Description
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                    What&apos;s Included With This Service
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-teal-600 shrink-0" />
                      <span>Thorough hardware diagnostic inspection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-teal-600 shrink-0" />
                      <span>Genuine, tested replacement components</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-teal-600 shrink-0" />
                      <span>Bench testing & safety calibration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-teal-600 shrink-0" />
                      <span>Pay online only after repair is completed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technician Profile Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
                    {service.technicianName?.charAt(0) || "T"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {service.technicianName}
                      </h4>
                      <span title="Verified Technician">
                        <ShieldCheck className="size-4 text-teal-700" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{service.technicianEmail}</p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      Verified Fixora Professional
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Sticky Booking Request Card */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
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
                    No upfront payment required. Pay through Stripe after the technician finishes the repair.
                  </p>
                </div>

                {/* Role Awareness Checks */}
                {user && user.role !== "customer" ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>Booking Restricted</span>
                    </div>
                    <p>
                      You are signed in as a <strong>{user.role}</strong>. Only customer accounts can book repair services. Please sign in with a customer account to request this service.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                      Send Repair Request
                    </h3>

                    {/* Preferred Date */}
                    <div className="space-y-1">
                      <Label htmlFor="reqDate" className="text-xs font-semibold text-slate-700">
                        Preferred Date *
                      </Label>
                      <Input
                        id="reqDate"
                        type="date"
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
                        onChange={(e) => setCustomerPhone(e.target.value)}
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
                        onChange={(e) => setCustomerAddress(e.target.value)}
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
                        placeholder="Describe what's wrong with your device or appliance..."
                        value={problemDescription}
                        onChange={(e) => setProblemDescription(e.target.value)}
                        required
                        className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold h-11 text-sm shadow-xs"
                    >
                      {isSubmitting ? (
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
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
