import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { ServiceCategory } from "@/types";
import {
  Wrench,
  Smartphone,
  Laptop,
  Wind,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
  Clock,
  CreditCard,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const categoryIcons: Record<ServiceCategory, LucideIcon> = {
  Smartphone,
  "Laptop & PC": Laptop,
  AC: Wind,
  Refrigerator,
  TV: Tv,
  "Washing Machine": WashingMachine,
  Electrical: Zap,
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
                  <CheckCircle2 className="size-4 text-teal-700" />
                  Admin-approved service listings
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
                  Need a repair for a device or home appliance?
                  <span className="block text-teal-700">Start with Fixora.</span>
                </h1>

                <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                  Browse available repair services, send a request, and follow
                  its status from your dashboard. Payment is requested after a
                  repair is marked complete.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/services">
                    <Button
                      size="lg"
                      className="bg-teal-700 hover:bg-teal-800 text-white font-semibold h-11 px-6 shadow-sm gap-2"
                    >
                      <Wrench className="size-4" />
                      Browse Services
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold h-11 px-6"
                    >
                      How Fixora Works
                    </Button>
                  </Link>
                </div>

                <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-teal-700 shrink-0" />
                    <span className="text-xs font-medium text-slate-700">
                      Approved listings
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-teal-700 shrink-0" />
                    <span className="text-xs font-medium text-slate-700">
                      Track job status
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-5 text-amber-600 shrink-0" />
                    <span className="text-xs font-medium text-slate-700">
                      Pay after completion
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md rounded-2xl bg-gradient-to-b from-teal-50 to-slate-100 p-6 sm:p-8 border border-slate-200/80 shadow-md">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">
                      <Wrench className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        How Fixora Works
                      </h2>
                      <p className="text-xs text-slate-500">
                        From service listing to completed repair
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-xs flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-teal-600 shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 block">
                          1. Browse services
                        </span>
                        <span className="text-slate-500">
                          Public listings are approved and available services.
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-xs flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-teal-600 shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 block">
                          2. Request a repair
                        </span>
                        <span className="text-slate-500">
                          Share the repair details and preferred date.
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-xs flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-teal-600 shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 block">
                          3. Track and pay
                        </span>
                        <span className="text-slate-500">
                          Follow the job status and pay after completion.
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 pt-5 border-t border-slate-200 text-xs text-slate-600">
                    Only approved and available services appear in Browse
                    Services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Browse by repair category
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Choose a device or home appliance to view available services.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              View All Services
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SERVICE_CATEGORIES.map((category) => {
              const Icon = categoryIcons[category];
              return (
                <Link
                  key={category}
                  href={`/services?category=${encodeURIComponent(category)}`}
                  className="group p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div className="size-11 rounded-lg bg-teal-50 group-hover:bg-teal-700 text-teal-700 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-teal-800 transition-colors">
                      {category}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Browse services
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
