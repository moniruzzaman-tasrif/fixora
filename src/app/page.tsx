import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Smartphone,
  Laptop,
  Wind,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
  ShieldCheck,
  Clock,
  CreditCard,
  ArrowRight,
  Star,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const categories = [
    { name: "Smartphone", icon: Smartphone, count: "48 Technicians" },
    { name: "Laptop & PC", icon: Laptop, count: "36 Technicians" },
    { name: "AC Servicing", icon: Wind, count: "52 Technicians" },
    { name: "Refrigerator", icon: Refrigerator, count: "29 Technicians" },
    { name: "Television", icon: Tv, count: "24 Technicians" },
    { name: "Washing Machine", icon: WashingMachine, count: "31 Technicians" },
    { name: "Electrical Wiring", icon: Zap, count: "45 Technicians" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headlines & CTA */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
                  <span className="flex size-2 rounded-full bg-teal-600 animate-pulse" />
                  Verified & Background-Checked Technicians
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
                  Broken Device? <br />
                  <span className="text-teal-700">Get It Fixed</span> By Verified
                  Experts.
                </h1>

                <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                  Fixora brings trusted repair professionals straight to your
                  doorstep. From smartphone screen replacements to AC
                  overhauls — track every step and pay online only after
                  satisfaction.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/services">
                    <Button
                      size="lg"
                      className="bg-teal-700 hover:bg-teal-800 text-white font-semibold h-11 px-6 shadow-sm gap-2"
                    >
                      <Wrench className="size-4" />
                      Browse All Services
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

                {/* Trust badges */}
                <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-teal-700 shrink-0" />
                    <span className="text-xs font-medium text-slate-700">
                      100% Verified Pros
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-teal-700 shrink-0" />
                    <span className="text-xs font-medium text-slate-700">
                      Real-time Tracking
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-5 text-amber-600 shrink-0" />
                    <span className="text-xs font-medium text-slate-700">
                      Pay After Service
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Feature Box */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md rounded-2xl bg-gradient-to-b from-teal-50 to-slate-100 p-6 sm:p-8 border border-slate-200/80 shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">
                        <Wrench className="size-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          Fixora Service Guarantee
                        </h2>
                        <p className="text-xs text-slate-500">
                          Category 006 Certified
                        </p>
                      </div>
                    </div>
                    <Badge variant="success" className="text-xs font-semibold">
                      Live Platform
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-xs flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-teal-600 shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 block">
                          Step 1: Choose Your Repair
                        </span>
                        <span className="text-slate-500">
                          Search 12+ approved home & device services
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-xs flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-teal-600 shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 block">
                          Step 2: Instant Technician Dispatch
                        </span>
                        <span className="text-slate-500">
                          Home visit or shop drop-off on your schedule
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-xs flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-teal-600 shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 block">
                          Step 3: Secure Stripe Payment
                        </span>
                        <span className="text-slate-500">
                          Pay only after the technician completes work
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      4.9/5 Average Rating
                    </span>
                    <span>Over 2,400+ repairs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories Grid Preview */}
        <section className="py-14 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Explore Popular Categories
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Select your appliance or smart device category to find certified technicians
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
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/services?category=${encodeURIComponent(cat.name)}`}
                  className="group p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div className="size-11 rounded-lg bg-teal-50 group-hover:bg-teal-700 text-teal-700 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-teal-800 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.count}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Fixora Inc. All rights reserved.</p>
          <p className="text-slate-400">
            Fixora — Your Home, Our Responsibility
          </p>
        </div>
      </footer>
    </div>
  );
}
