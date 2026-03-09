"use client";

import { useState } from "react";
import { Ticket } from "@/types/ticket";

interface TicketCardProps {
  ticket: Ticket;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  accepted: { label: "Accepted", class: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
  completed: { label: "Completed", class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
};

const statusBar: Record<string, string> = {
  pending: "bg-amber-400",
  accepted: "bg-sky-400",
  completed: "bg-emerald-400",
};

export default function TicketCard({ ticket, onAccept, onComplete }: TicketCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sc = statusConfig[ticket.status] ?? statusConfig["pending"];

  const formattedDate = new Date(ticket.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden transition-all duration-200 hover:border-slate-600/80 hover:shadow-lg hover:shadow-black/20">
      {/* Status bar */}
      <div className={`h-[3px] ${statusBar[ticket.status] ?? "bg-slate-600"}`} />

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-slate-600">#{ticket.refId}</span>
              <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${sc.class}`}>
                {sc.label}
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                {ticket.kind}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-200 leading-snug">{ticket.request_type}</h3>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-600 mb-3">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </div>
          {ticket.completeDueAt && (
            <div className="flex items-center gap-1 text-amber-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Due {new Date(ticket.completeDueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          )}
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

          {ticket.status === "pending" && (
            <button
              onClick={() => onAccept?.(ticket.refId)}
              className="text-[10px] font-mono px-2.5 py-1 rounded bg-sky-400/10 text-sky-400 border border-sky-400/30 hover:bg-sky-400/20 transition-colors uppercase tracking-wider"
            >
              Accept
            </button>
          )}
          {ticket.status === "accepted" && (
            <button
              onClick={() => onComplete?.(ticket.refId)}
              className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/20 transition-colors uppercase tracking-wider"
            >
              Complete
            </button>
          )}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-3">
            {[
              { label: "Raised By", value: ticket.raised_by },
              { label: "Accepted By", value: ticket.accepted_by ?? "—" },
              { label: "Created", value: formattedDate },
              { label: "Accepted At", value: ticket.acceptedAt ? new Date(ticket.acceptedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
              { label: "Accept Due", value: ticket.acceptDueAt ? new Date(ticket.acceptDueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—" },
              { label: "Complete Due", value: ticket.completeDueAt ? new Date(ticket.completeDueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—" },
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
