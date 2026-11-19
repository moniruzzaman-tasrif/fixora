"use client";

import * as React from "react";
import { User, Wrench, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectableRole = "customer" | "technician";

interface RoleSelectorProps {
  value: SelectableRole;
  onChange: (role: SelectableRole) => void;
  disabled?: boolean;
}
export function RoleSelector({
  value,
  onChange,
  disabled = false,
}: RoleSelectorProps) {
  const roles: {
    id: SelectableRole;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: "customer",
      title: "Customer",
      icon: User,
    },
    {
      id: "technician",
      title: "Technician",
      icon: Wrench,
    },
  ];

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-semibold text-slate-800">
        I am registering as <span className="text-red-500">*</span>
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roles.map((role) => {
          const isSelected = value === role.id;
          const Icon = role.icon;

          return (
            <label
              key={role.id}
              className={cn(
                "relative block cursor-pointer rounded-xl transition-all duration-150 select-none",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <input
                type="radio"
                name="role"
                value={role.id}
                checked={isSelected}
                onChange={() => onChange(role.id)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "flex items-center justify-between rounded-xl border p-3.5 transition-all duration-150",
                isSelected
                  ? "border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70",
                  "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-teal-600 peer-focus-visible:ring-offset-2",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg transition-colors shrink-0",
                      isSelected
                        ? "bg-teal-700 text-white"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <span
                    className={cn(
                      "truncate text-sm font-semibold transition-colors",
                      isSelected ? "text-teal-950 font-bold" : "text-slate-800"
                    )}
                  >
                    {role.title}
                  </span>
                </span>

                <span
                  className={cn(
                    "ml-2 flex size-5 shrink-0 items-center justify-center rounded-full border transition-all",
                    isSelected
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-300 bg-white"
                  )}
                  aria-hidden="true"
                >
                  {isSelected && <CheckCircle2 className="size-4 text-white" />}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
