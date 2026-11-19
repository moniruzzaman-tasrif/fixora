import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle className="size-7" />
        </div>
        <p className="text-sm font-bold text-teal-700">404</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          The page you requested does not exist or may have moved.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button className="bg-teal-700 text-white hover:bg-teal-800">
            Return home
          </Button>
        </Link>
      </div>
    </main>
  );
}
