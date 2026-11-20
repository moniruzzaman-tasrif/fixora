/**
 * PageHeader — standard heading bar used at the top of every dashboard section.
 * Renders a large heading and optional sub-description on the left, and passes
 * `children` (action buttons, filters) into a right-aligned flex row.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  heading: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  heading,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80 mb-6",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {heading}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2.5 shrink-0">{children}</div>
      )}
    </div>
  );
}
