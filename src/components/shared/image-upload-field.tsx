"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Trash2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MAX_IMAGE_MB, validateImageFile } from "@/lib/upload";
import { cn } from "@/lib/utils";

type ImageShape = "avatar" | "banner";

type ImageUploadFieldProps = {
  id: string;
  value: File | null;
  onChange: (file: File | null) => void;
  onError: (message?: string) => void;
  error?: string;
  disabled?: boolean;
  /** `avatar` renders a round 80px preview, `banner` a wide 16:9 preview. */
  shape?: ImageShape;
  /** Shown inside the avatar placeholder before a photo is picked. */
  fallbackText?: string;
  /** Defaults to the size/format helper text. */
  hint?: string;
};

/**
 * Image picker with a local preview. The file is uploaded on submit through
 * `uploadImage`; this component never talks to the network itself.
 */
export function ImageUploadField({
  id,
  value,
  onChange,
  onError,
  error,
  disabled = false,
  shape = "avatar",
  fallbackText,
  hint,
}: ImageUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const previewUrlRef = React.useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    []
  );

  const replaceFile = (nextFile: File | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    const nextUrl = nextFile ? URL.createObjectURL(nextFile) : null;
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
    onChange(nextFile);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;

    // Let the user pick the same file again after removing it.
    event.target.value = "";

    if (!selected) return;

    const problem = validateImageFile(selected);
    if (problem) {
      replaceFile(null);
      onError(problem);
      return;
    }

    onError(undefined);
    replaceFile(selected);
  };

  const removeFile = () => {
    replaceFile(null);
    onError(undefined);
    inputRef.current?.focus();
  };

  const isBanner = shape === "banner";

  return (
    <div
      className={cn(
        "flex gap-4",
        isBanner ? "flex-col" : "items-center"
      )}
    >
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden border bg-slate-50 text-slate-400",
          isBanner
            ? "aspect-video w-full max-w-sm rounded-xl"
            : "size-20 rounded-full",
          error ? "border-red-500" : "border-slate-200"
        )}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Selected image preview"
            fill
            unoptimized
            sizes={isBanner ? "(max-width: 640px) 100vw, 384px" : "80px"}
            className="object-cover"
          />
        ) : fallbackText ? (
          <span className="text-xl font-semibold text-slate-500">
            {fallbackText}
          </span>
        ) : (
          <User className="size-7" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={disabled}
            onChange={handleFileInput}
            aria-describedby={error ? `${id}-error` : `${id}-hint`}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 px-3 text-slate-700"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="size-4" aria-hidden="true" />
            {value ? "Change image" : "Upload image"}
          </Button>

          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 px-2.5 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={disabled}
              onClick={removeFile}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Remove
            </Button>
          ) : null}
        </div>

        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {value
            ? value.name
            : (hint ??
              `Optional. JPG, PNG or WebP up to ${MAX_IMAGE_MB} MB.`)}
        </p>

        {error ? (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-xs font-medium text-red-600"
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
