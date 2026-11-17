import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: keyof typeof STATUS_COLORS | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedKey = status.toLowerCase() as keyof typeof STATUS_COLORS;
  const config = STATUS_COLORS[normalizedKey] || {
    label: status,
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
