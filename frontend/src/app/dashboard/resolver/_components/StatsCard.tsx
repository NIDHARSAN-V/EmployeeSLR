"use client";

import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  accent?: "amber" | "red" | "green" | "blue";
  trend?: { value: number; direction: "up" | "down" };
}

const accentMap = {
  amber: {
    border: "border-amber-400",
    icon: "bg-amber-400/10 text-amber-400",
    dot: "bg-amber-400",
    text: "text-amber-400",
  },
  red: {
    border: "border-red-400",
    icon: "bg-red-400/10 text-red-400",
    dot: "bg-red-400",
    text: "text-red-400",
  },
  green: {
    border: "border-emerald-400",
    icon: "bg-emerald-400/10 text-emerald-400",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
  },
  blue: {
    border: "border-sky-400",
    icon: "bg-sky-400/10 text-sky-400",
    dot: "bg-sky-400",
    text: "text-sky-400",
  },
};

export default function StatsCard({
  label,
  value,
  sub,
  icon,
  accent = "amber",
  trend,
}: StatsCardProps) {
  const a = accentMap[accent];

  return (
    <div
      className={`relative bg-slate-900 border border-slate-700/60 rounded-lg p-5 overflow-hidden group hover:border-opacity-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${a.dot} opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-100 tabular-nums leading-none">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-slate-500 mt-2 font-mono">{sub}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-mono ${trend.direction === "up" ? "text-emerald-400" : "text-red-400"}`}>
              <span>{trend.direction === "up" ? "▲" : "▼"}</span>
              <span>{Math.abs(trend.value)}% from last week</span>
            </div>
          )}
        </div>
        <div className={`flex-shrink-0 w-10 h-10 rounded-md ${a.icon} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
