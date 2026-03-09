"use client";

import { useState } from "react";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  requester: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline?: string;
}

interface TicketCardProps {
  ticket: Ticket;
  onStatusChange?: (id: string, status: Ticket["status"]) => void;
}

const priorityConfig = {
  low: { label: "Low", class: "text-slate-400 bg-slate-400/10 border-slate-400/30" },
  medium: { label: "Medium", class: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  high: { label: "High", class: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  critical: { label: "Critical", class: "text-red-400 bg-red-400/10 border-red-400/30" },
};

const priorityBar = {
  low: "bg-slate-500",
  medium: "bg-amber-400",
  high: "bg-orange-400",
  critical: "bg-red-500",
};

const statusConfig = {
  open: { label: "Open", class: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  in_progress: { label: "In Progress", class: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
  resolved: { label: "Resolved", class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
  closed: { label: "Closed", class: "text-slate-500 bg-slate-500/10 border-slate-500/30" },
};

export default function TicketCard({ ticket, onStatusChange }: TicketCardProps) {
  const [expanded, setExpanded] = useState(false);
  const pc = priorityConfig[ticket.priority];
  const sc = statusConfig[ticket.status];

  return (
    <div
      className={`bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden transition-all duration-200 hover:border-slate-600/80 hover:shadow-lg hover:shadow-black/20 ${
        ticket.priority === "critical" ? "border-l-2 border-l-red-500" : ""
      }`}
    >
      {/* Priority bar */}
      <div className={`h-[3px] ${priorityBar[ticket.priority]}`} />

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-slate-600">#{ticket.id}</span>
              <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${pc.class}`}>
                {pc.label}
              </span>
              <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${sc.class}`}>
                {sc.label}
              </span>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                {ticket.category}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-200 leading-snug">{ticket.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
          {ticket.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{ticket.requester}</span>
            </div>
            {ticket.slaDeadline && (
              <div className="flex items-center gap-1 text-amber-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>SLA {ticket.slaDeadline}</span>
              </div>
            )}
          </div>
          <span>{ticket.updatedAt}</span>
        </div>

        {/* Expand / Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider"
          >
            {expanded ? "▲ Collapse" : "▼ Details"}
          </button>
          <div className="flex-1" />
          {ticket.status === "open" && (
            <button
              onClick={() => onStatusChange?.(ticket.id, "in_progress")}
              className="text-[10px] font-mono px-2.5 py-1 rounded bg-sky-400/10 text-sky-400 border border-sky-400/30 hover:bg-sky-400/20 transition-colors uppercase tracking-wider"
            >
              Pick Up
            </button>
          )}
          {ticket.status === "in_progress" && (
            <button
              onClick={() => onStatusChange?.(ticket.id, "resolved")}
              className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/20 transition-colors uppercase tracking-wider"
            >
              Resolve
            </button>
          )}
          <button className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 transition-colors uppercase tracking-wider">
            View →
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-3">
            {[
              { label: "Assignee", value: ticket.assignee },
              { label: "Created", value: ticket.createdAt },
              { label: "Last Update", value: ticket.updatedAt },
              { label: "Category", value: ticket.category },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-xs text-slate-400 font-mono">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
