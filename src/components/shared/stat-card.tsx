import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName = "bg-teal-50 text-teal-700",
  trend,
}: StatCardProps) {
  return (
    <Card className="border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {value}
              </span>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-emerald-600" : "text-slate-500"
                  )}
                >
                  {trend.value}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 font-normal">{subtitle}</p>
            )}
          </div>

          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              iconClassName
            )}
          >
            <Icon className="size-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
