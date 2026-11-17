"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BarData {
  label: string;
  value: number;
  highlight?: boolean;
}

interface MiniBarChartProps {
  title: string;
  subtitle?: string;
  data: BarData[];
  height?: number;
  valuePrefix?: string;
  className?: string;
}

export function MiniBarChart({
  title,
  subtitle,
  data,
  height = 140,
  valuePrefix = "",
  className,
}: MiniBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card className={cn("border border-slate-200/90 shadow-xs", className)}>
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-4">
        <div
          className="flex items-end justify-between gap-2 pt-2"
          style={{ height }}
        >
          {data.map((item) => {
            const percentage = Math.round((item.value / maxValue) * 100);

            return (
              <div
                key={item.label}
                className="group flex-1 flex flex-col items-center h-full justify-end gap-1.5"
              >
                {/* Tooltip / value indicator */}
                <div className="text-[10px] font-semibold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {valuePrefix}
                  {item.value}
                </div>

                {/* Bar */}
                <div className="w-full max-w-[32px] bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end h-full">
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all duration-500",
                      item.highlight
                        ? "bg-teal-700 group-hover:bg-teal-800"
                        : "bg-teal-500/70 group-hover:bg-teal-600"
                    )}
                    style={{ height: `${Math.max(percentage, 8)}%` }}
                  />
                </div>

                {/* X-axis Label */}
                <span className="text-[11px] font-medium text-slate-500 truncate max-w-[40px] text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface MiniDonutChartProps {
  title: string;
  subtitle?: string;
  data: DonutItem[];
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
}

export function MiniDonutChart({
  title,
  subtitle,
  data,
  centerLabel,
  centerValue,
  className,
}: MiniDonutChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;

  // Calculate SVG stroke dashes for SVG circle donut
  let cumulativePercent = 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const slices = data.map((item) => {
    const percent = (item.value / total) * 100;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += percent;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <Card className={cn("border border-slate-200/90 shadow-xs", className)}>
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base font-bold text-slate-900">
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </CardHeader>

      <CardContent className="p-5 pt-2 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* SVG Donut */}
        <div className="relative size-32 shrink-0 flex items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="14"
              fill="transparent"
            />
            {slices.map((slice, i) => (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                stroke={slice.color}
                strokeWidth="14"
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerValue && (
              <span className="text-lg font-bold text-slate-900 leading-none">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                {centerLabel}
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1 w-full">
          {data.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 truncate font-medium">
                  {item.label}
                </span>
              </div>
              <span className="font-bold text-slate-900 ml-2">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
