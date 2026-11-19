"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </div>
        <p className="text-sm font-bold text-teal-700">Fixora</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We could not load this page. Please try again or return to Fixora home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            onClick={retry}
            className="gap-2 bg-teal-700 text-white hover:bg-teal-800"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </Button>
          <Link href="/">
            <Button type="button" variant="outline">
              Return home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
