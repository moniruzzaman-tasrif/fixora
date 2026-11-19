import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";

const socialLinks = [
  { name: "X", href: "https://x.com/", icon: SiX },
  { name: "Facebook", href: "https://www.facebook.com/", icon: SiFacebook },
  { name: "Instagram", href: "https://www.instagram.com/", icon: SiInstagram },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo showTagline={true} size="default" />
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-3">
              Browse repair service listings, request a job, and follow its
              progress from your Fixora account.
            </p>
          </div>

          {/* Service Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Repair Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              {SERVICE_CATEGORIES.map((category) => (
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
                  href="/"
                  className="text-slate-500 hover:text-teal-700 transition-colors"
                >
                  Home
                </Link>
              </li>
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
                  Create an Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3" aria-label="Social networks">
          {socialLinks.map(({ name, href, icon: Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${name}`}
              className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-teal-300 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              <Icon className="size-4" aria-hidden="true" />
            </a>
          ))}
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>Fixora. All rights reserved.</p>
          <p>Your Home, Our Responsibility.</p>
        </div>
      </div>
    </footer>
  );
}
