/**
 * AdminServiceImage — image thumbnail used inside admin dashboard tables and
 * moderation cards. Falls back to a Wrench placeholder icon when the URL is
 * absent or the remote image fails to load, preventing broken-image slots.
 * Uses a plain <img> tag (not next/image) because admin listings come from
 * external ImgBB URLs with no fixed dimensions.
 */
"use client";

import * as React from "react";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminServiceImageProps = {
  src?: string;
  alt: string;
  className?: string;
};

export function AdminServiceImage({
  src,
  alt,
  className,
}: AdminServiceImageProps) {
  // Track the src that caused an error so it is never re-attempted this session.
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);

  // Show the placeholder when there is no src or when the last load failed.
  if (!src || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={`${alt} image unavailable`}
        className={cn(
          "flex items-center justify-center bg-slate-100 text-slate-400",
          className
        )}
      >
        <Wrench className="size-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden bg-slate-100", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="size-full object-cover"
        onError={() => setFailedSrc(src)}
      />
    </div>
  );
}
