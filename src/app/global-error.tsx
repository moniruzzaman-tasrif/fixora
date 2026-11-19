"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCcw, Wrench } from "lucide-react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-sans text-slate-700">
        <main className="max-w-md text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm">
            <Wrench className="size-8 -rotate-12" aria-hidden="true" />
          </div>
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
            <AlertTriangle className="size-4" aria-hidden="true" />
            Fixora is having trouble
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            We could not load the app
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Please try loading Fixora again or return to the home page.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={retry}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Return home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
