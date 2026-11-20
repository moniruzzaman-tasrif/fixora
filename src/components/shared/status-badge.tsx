/**
 * StatusBadge — single source of truth for booking/service status colours.
 * Looks up the given status string in the STATUS_COLORS map from constants.ts
 * and renders a consistently styled pill. Falls back to a neutral slate badge
 * for unknown statuses so new DB values don't break the UI.
 */
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: keyof typeof STATUS_COLORS | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const safeStatus = (status || "requested").toString();
  const normalizedKey = safeStatus.toLowerCase() as keyof typeof STATUS_COLORS;
  const config = STATUS_COLORS[normalizedKey] || {
    label: safeStatus,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold text-[11px] px-2.5 py-0.5 rounded-full capitalize border",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
