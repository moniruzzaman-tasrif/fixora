import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-700">
      {/* Top Header bar with Logo & Back to Home */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xs py-3 px-4 sm:px-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Logo showTagline size="default" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">{children}</div>
      </main>

      {/* Clean Auth Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Fixora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
