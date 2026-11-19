"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  value: string;
  showValidationRules?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  error?: string;
}

export function PasswordField({
  value,
  showValidationRules = false,
  onValidationChange,
  error,
  className,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  // Validation rules
  const hasMinLength = value.length >= 6;
  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const isValid = hasMinLength && hasUppercase && hasLowercase;

  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          className={cn(
            "pr-10",
            error
              ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
              : "",
            className
          )}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute right-2 top-1/2 -translate-y-1/2 size-7 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </Button>
      </div>

      {/* Field error message */}
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      {/* Real-time Checklist for Sign Up */}
      {showValidationRules && value.length > 0 && (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
          <p className="font-semibold text-slate-700 text-[11px] mb-1">
            Password requirements:
          </p>
          <div className="flex items-center gap-1.5">
            {hasMinLength ? (
              <Check className="size-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="size-3.5 text-slate-400 shrink-0" />
            )}
            <span
              className={cn(
                hasMinLength
                  ? "text-emerald-700 font-medium"
                  : "text-slate-500"
              )}
            >
              At least 6 characters
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {hasUppercase ? (
              <Check className="size-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="size-3.5 text-slate-400 shrink-0" />
            )}
            <span
              className={cn(
                hasUppercase
                  ? "text-emerald-700 font-medium"
                  : "text-slate-500"
              )}
            >
              At least one uppercase letter (A-Z)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {hasLowercase ? (
              <Check className="size-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="size-3.5 text-slate-400 shrink-0" />
            )}
            <span
              className={cn(
                hasLowercase
                  ? "text-emerald-700 font-medium"
                  : "text-slate-500"
              )}
            >
              At least one lowercase letter (a-z)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
