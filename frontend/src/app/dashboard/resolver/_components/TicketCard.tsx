"use client";

import { useEffect, useState } from "react";
import { Ticket } from "@/types/ticket";
import { Content } from "@/types/content";
import { GetMessages } from "@/api/content";

interface TicketCardProps {
  ticket: Ticket;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-amber-400/70" },
  accepted: { label: "Accepted", color: "text-sky-400/70" },
  completed: { label: "Completed", color: "text-emerald-400/70" },
};

const statusAccent: Record<string, string> = {
  pending: "border-l-amber-400/40",
  accepted: "border-l-sky-400/40",
  completed: "border-l-emerald-400/40",
};

export default function TicketCard({ ticket, onAccept, onComplete }: TicketCardProps) {
  const [messages, setMessages] = useState<Content| null>(null);
  const [expanded, setExpanded] = useState(false);
  const sc = statusConfig[ticket.status] ?? statusConfig["pending"];
  const accent = statusAccent[ticket.status] ?? "border-l-slate-700";

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const allTickets = await GetMessages("ticket", ticket.refId);
        setMessages(allTickets);
      } catch {
        setMessages(null);
      }
    };
    fetchTickets();
  }, [ticket.refId]);

  const formattedDate = new Date(ticket.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className={`bg-[#0d1117] border border-slate-800 border-l-2 ${accent} hover:border-slate-700 transition-all duration-200`}>
      <div className="p-4">

        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] tracking-widest uppercase">{ticket.kind}</span>
              <span className="text-[10px]">·</span>
              <span className="text-[10px] tracking-wider">#{ticket.refId}</span>
            </div>
            <h3 className="text-sm font-medium leading-snug">{ticket.request_type}</h3>
          </div>
          <span className={`text-[10px] uppercase tracking-widest shrink-0 ${sc.color}`}>
            {sc.label}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-[11px] mb-4">
          <span>{formattedDate}</span>
          {ticket.completeDueAt && (
            <span className="text-amber-500/60">
              Due {new Date(ticket.completeDueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] uppercase tracking-widest hover:text-slate-400 transition-colors"
          >
            {expanded ? "Hide" : "Details"}
          </button>

          <div className="flex-1" />

          {ticket.status === "pending" && (
            <button
              onClick={() => onAccept?.(ticket.refId)}
              className="text-[11px] uppercase tracking-widest text-sky-400 hover:text-sky-300 transition-colors"
            >
              Accept →
            </button>
          )}
          {ticket.status === "accepted" && (
            <button
              onClick={() => onComplete?.(ticket.refId)}
              className="text-[11px] uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Complete →
            </button>
          )}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-x-6 gap-y-3">
            {[
              { label: "Raised By", value: ticket.raised_by },
              { label: "Accepted By", value: ticket.accepted_by ?? "—" },
              { label: "Created", value: formattedDate },
              { label: "Accepted At", value: ticket.acceptedAt ? new Date(ticket.acceptedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
              { label: "Accept Due", value: ticket.acceptDueAt ? new Date(ticket.acceptDueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—" },
              { label: "Complete Due", value: ticket.completeDueAt ? new Date(ticket.completeDueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-0.5">{label}</p>
                <p className="text-xs text-slate-400">{value}</p>
              </div>
            ))}
          </div>
        )}
        {expanded && (
  <div>
    <div className="font-mono text-amber-500 pt-5">Comments:</div>
    {!messages || messages.messages.length === 0 ? (
      <div className="text-[10px] text-slate-500 italic">No comments for this ticket</div>
    ) : (
      messages.messages.map((msg) => (
        <div key={msg._id} className="text-[10px] uppercase tracking-widest text-slate-600 mb-0.5 mt-2">
          {msg.message}
        </div>
      ))
    )}
  </div>
)}
        
      </div>
    </div>
  );
}