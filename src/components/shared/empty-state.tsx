/**
 * EmptyState — full-width placeholder shown when a list or table returns no
 * records. Renders an icon, heading, and description, plus an optional CTA
 * that can either navigate (actionHref) or trigger a callback (onAction).
 * Keeps an honest "nothing here" message rather than hiding empty sections.
 */
import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Inbox, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 sm:p-12 text-center",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-200 text-teal-700 mb-4">
        <Icon className="size-7" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <div>
          {actionHref ? (
            <Link href={actionHref}>
              <Button className="bg-teal-700 hover:bg-teal-800 text-white font-semibold">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button
              onClick={onAction}
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
