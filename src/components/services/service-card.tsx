import Link from "next/link";
import Image from "next/image";
import { Service } from "@/types";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Clock, MapPin, User, ArrowRight, Home, Store } from "lucide-react";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  
  const isHomeVisit = service.serviceMode === "Home Visit";

  return (
    <div className="group flex flex-col justify-between h-full rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-200 overflow-hidden">
      {/* Top Media & Badges */}
      <div>
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 border-b border-slate-100">
          {service.image ? (
            <Image
              src={service.image}
              alt={service.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-teal-50 text-teal-700">
              <Wrench className="size-8" />
            </div>
          )}

          {/* Category Chip */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 shadow-xs backdrop-blur-xs border border-slate-200/60">
              {service.category}
            </span>
          </div>

          {/* Mode Chip */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs backdrop-blur-xs ${
                isHomeVisit
                  ? "bg-teal-700 text-white"
                  : "bg-slate-900/80 text-white"
              }`}
            >
              {isHomeVisit ? (
                <Home className="size-3" />
              ) : (
                <Store className="size-3" />
              )}
              <span>{service.serviceMode}</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <div>
            <Link href={`/services/${service._id}`}>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition-colors line-clamp-1 leading-snug">
                {service.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Meta details */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-slate-400 shrink-0" />
              <span>Est. {service.estimatedDuration}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{service.serviceArea}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <User className="size-3.5 text-teal-700 shrink-0" />
              <span className="font-medium text-slate-700 truncate">
                {service.technicianName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="p-5 pt-0 mt-2">
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Starting at
            </span>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(service.basePrice)}
            </span>
          </div>

          <Link href={`/services/${service._id}`}>
            <Button
              size="sm"
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs h-9 px-3.5 gap-1.5 shadow-xs"
            >
              <span>View Details</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
