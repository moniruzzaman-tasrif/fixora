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
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800 block">
        I am registering as <span className="text-red-500">*</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roles.map((role) => {
          const isSelected = value === role.id;
          const Icon = role.icon;

          return (
            <div
              key={role.id}
              onClick={() => !disabled && onChange(role.id)}
              className={cn(
                "relative flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all duration-150 select-none",
                isSelected
                  ? "border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg transition-colors shrink-0",
                    isSelected
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  <Icon className="size-4.5" />
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold truncate transition-colors",
                    isSelected ? "text-teal-950 font-bold" : "text-slate-800"
                  )}
                >
                  {role.title}
                </span>
              </div>

              <div
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border transition-all shrink-0 ml-2",
                  isSelected
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-slate-300 bg-white"
                )}
              >
                {isSelected && (
                  <CheckCircle2 className="size-4 text-white" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
