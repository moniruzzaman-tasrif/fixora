import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { ShieldCheck, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo showTagline={true} size="default" />
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-3">
              Fixora connects customers with background-checked repair
              technicians for smart devices and home appliances. Pay safely
              online only after your repair is completed.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-full w-fit border border-teal-200">
              <ShieldCheck className="size-4 text-teal-700" />
              <span>100% Verified Technicians & Secure Stripe Payments</span>
            </div>
          </div>

          {/* Service Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Repair Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              {SERVICE_CATEGORIES.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link
                    href={`/services?category=${encodeURIComponent(category)}`}
                    className="text-slate-500 hover:text-teal-700 transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/services"
                  className="text-teal-700 font-semibold hover:underline"
                >
                  View All Categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/services"
                  className="text-slate-500 hover:text-teal-700 transition-colors"
                >
                  Browse Services
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-500 hover:text-teal-700 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="text-slate-500 hover:text-teal-700 transition-colors"
                >
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-up"
                  className="text-slate-500 hover:text-teal-700 transition-colors"
                >
                  Join as Technician
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Support
            </h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-teal-700 shrink-0" />
                <span>support@fixora.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-teal-700 shrink-0" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-teal-700 shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Fixora Inc. All rights reserved.</p>
          <p>Your Home, Our Responsibility.</p>
        </div>
      </div>
    </footer>
  );
}
