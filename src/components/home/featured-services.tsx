"use client";

import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { ServiceCard } from "@/components/services/service-card";
import { Button } from "@/components/ui/button";
import getService from "@/lib/action/dataGet/getService";
import type { Service } from "@/types";

export function FeaturedServices() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    getService("sort=newest&limit=6")
      .then((data) => {
        if (cancelled) return;
        setServices(Array.isArray(data) ? data : []);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setServices([]);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Could not load repair services. Please try again."
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  if (!isLoading && !loadError && services.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Latest available services
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Recent listings approved and available to request.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse space-y-4 rounded-2xl border border-slate-200 bg-white p-4"
              aria-hidden="true"
            >
              <div className="aspect-16/10 rounded-xl bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
              <div className="h-9 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div
          className="flex flex-col items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center"
          role="alert"
        >
          <AlertCircle className="size-6 text-amber-700" aria-hidden="true" />
          <p className="text-sm text-amber-950">
            Latest services could not be loaded: {loadError}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsLoading(true);
              setRetryKey((key) => key + 1);
            }}
            className="gap-2 border-amber-300"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </section>
  );
}
