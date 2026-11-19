import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserCheck, Wrench, CreditCard } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Choose a repair",
    text: "Browse approved services and select a home visit or shop drop-off.",
  },
  {
    icon: UserCheck,
    title: "Send your request",
    text: "Provide the preferred date, address, phone number, and problem details.",
  },
  {
    icon: Wrench,
    title: "Track the work",
    text: "Follow the booking as its status changes from accepted to completed.",
  },
  {
    icon: CreditCard,
    title: "Pay after completion",
    text: "Payment is due after the technician marks the repair complete.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-slate-200 bg-white py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold text-teal-700">How Fixora Works</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
                A clear repair journey, from request to payment.
              </h1>
              <p className="text-base leading-relaxed text-slate-600">
                Browse approved service listings, submit a repair request, and
                follow the booking status and final amount in your account.
              </p>
              <Link href="/services">
                <Button className="mt-2 bg-teal-700 text-white hover:bg-teal-800">
                  Browse repair services
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <Icon className="size-5" />
                    </div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                      Step {index + 1}
                    </p>
                    <h2 className="mb-2 text-lg font-bold text-slate-900">
                      {step.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {step.text}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
