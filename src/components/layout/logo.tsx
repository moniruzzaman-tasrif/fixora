import Link from "next/link";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "default" | "lg";
}

export function Logo({
  className,
  showTagline = false,
  size = "default",
}: LogoProps) {
  const iconSizeClasses = {
    sm: "size-7 rounded-lg",
    default: "size-9 rounded-xl",
    lg: "size-11 rounded-2xl",
  };

  const svgSizeClasses = {
    sm: "size-3.5",
    default: "size-4.5",
    lg: "size-5.5",
  };

  const textClasses = {
    sm: "text-lg",
    default: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-2.5 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 rounded-lg",
        className
      )}
      aria-label="Fixora - Home"
    >
      {/* Icon Mark: Wrench inside rounded square with deep teal & warm amber accent */}
      <div
        className={cn(
          "relative flex items-center justify-center bg-teal-700 text-white shadow-sm ring-1 ring-teal-800/20 group-hover:bg-teal-800 transition-colors shrink-0",
          iconSizeClasses[size]
        )}
      >
        <Wrench className={cn("rotate-[-20deg]", svgSizeClasses[size])} />
        {/* Warm amber accent dot */}
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-amber-400 ring-2 ring-white" />
      </div>

      <div className="flex flex-col">
        <span
          className={cn(
            "font-bold tracking-tight text-slate-900 group-hover:text-teal-900 leading-none transition-colors",
            textClasses[size]
          )}
        >
          Fix<span className="text-teal-700">ora</span>
        </span>
        {showTagline && (
          <span className="text-[10px] text-slate-500 font-medium tracking-normal mt-0.5">
            Your Home, Our Responsibility
          </span>
        )}
      </div>
    </Link>
  );
}
