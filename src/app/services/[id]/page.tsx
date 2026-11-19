import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import OneGetData from "@/lib/action/dataGet/OneGetData";
import { ServiceBookingCard } from "@/components/services/service-booking-card";
import {
  Wrench,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Home,
  Store,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";

interface ServiceDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ServiceDetailsPage({ params }: ServiceDetailsPageProps) {
  return (
    <Suspense fallback={<ServiceDetailsSkeleton />}>
      <ServiceDetailsContent params={params} />
    </Suspense>
  );
}

function ServiceDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-16/10 w-full animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-slate-100" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-80 w-full animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function ServiceDetailsContent({ params }: ServiceDetailsPageProps) {
  const { id } = await params;
  const data = await OneGetData(id);

  if (!data) {
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

  const isHomeVisit = data.serviceMode === "Home Visit";

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
                {data.title}
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
                {data.image ? (
                  <Image
                    src={data.image}
                    alt={data.title}
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
                    {data.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-xs ${
                      isHomeVisit ? "bg-teal-700" : "bg-slate-900"
                    }`}
                  >
                    {isHomeVisit ? <Home className="size-3" /> : <Store className="size-3" />}
                    <span>{data.serviceMode}</span>
                  </span>
                </div>
              </div>

              {/* Title & Key Highlights */}
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                  {data.title}
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Clock className="size-4 text-teal-700" />
                      <span>Duration</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">
                      {data.estimatedDuration}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <MapPin className="size-4 text-teal-700" />
                      <span>Coverage Area</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {data.serviceArea}
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
                  {data.description}
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
                    {data.technicianName?.charAt(0) || "T"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {data.technicianName}
                      </h4>
                      <span title="Verified Technician">
                        <ShieldCheck className="size-4 text-teal-700" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{data.technicianEmail}</p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      Verified Fixora Professional
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Sticky Booking Request Card (Client Component) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <ServiceBookingCard service={data} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
