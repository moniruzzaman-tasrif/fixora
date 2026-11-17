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
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: "customer",
      title: "I need repairs (Customer)",
      subtitle: "Browse certified technicians, book repairs & pay after completion.",
      icon: User,
    },
    {
      id: "technician",
      title: "I fix devices (Technician)",
      subtitle: "List repair services, accept job requests & grow your business.",
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
                "relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all duration-150 select-none",
                isSelected
                  ? "border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg transition-colors",
                    isSelected
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  <Icon className="size-4.5" />
                </div>
                {isSelected && (
                  <CheckCircle2 className="size-4.5 text-teal-700 shrink-0" />
                )}
              </div>

              <div>
                <p
                  className={cn(
                    "text-sm font-bold transition-colors",
                    isSelected ? "text-teal-950" : "text-slate-900"
                  )}
                >
                  {role.title}
                </p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {role.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
