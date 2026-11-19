import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <div className="relative mx-auto mb-5 flex size-20 items-center justify-center rounded-3xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
          <Wrench className="size-10 -rotate-12" aria-hidden="true" />
          <span className="absolute -bottom-2 -right-2 rounded-full bg-amber-400 px-2 py-1 text-xs font-bold text-slate-900 ring-4 ring-slate-50">
            404
          </span>
        </div>
        <p className="text-sm font-bold text-teal-700">Fixora</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          The page you requested does not exist or may have moved.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button className="gap-2 bg-teal-700 text-white hover:bg-teal-800">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Return home
          </Button>
        </Link>
      </div>
    </main>
  );
}
