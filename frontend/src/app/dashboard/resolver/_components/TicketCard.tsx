"use client";

import { useState, useEffect } from "react";
import { Ticket } from "@/types/ticket";
import { GetUserById } from "@/api/user";
import { useAuth } from "@/context/AuthContext";
import DiscussionModal from "@/app/dashboard/resolver/_components/DiscussionModal";

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

export default function TicketCard({
  ticket,
  onAccept,
  onComplete,
}: TicketCardProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const [raisedByName, setRaisedByName] = useState<string>(ticket.raised_by);
  const [acceptedByName, setAcceptedByName] = useState<string | null>(null);

  const sc = statusConfig[ticket.status] ?? statusConfig["pending"];
  const accent = statusAccent[ticket.status] ?? "border-l-slate-700";

  const formattedDate = new Date(ticket.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        if (ticket.raised_by) {
          const user = await GetUserById(ticket.raised_by);
          setRaisedByName(user.userName);
        }
        if (ticket.accepted_by) {
          const user = await GetUserById(ticket.accepted_by);
          setAcceptedByName(user.userName);
        }
      } catch (error) {
        console.error("Error fetching user names:", error);
      }
    };

    fetchUserNames();
  }, [ticket.raised_by, ticket.accepted_by]);

  return (
    <div
      className={`bg-[#0d1117] border border-slate-800 border-l-2 ${accent} hover:border-slate-700 transition-all duration-200`}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] text-slate-600 tracking-widest uppercase">
                {ticket.kind}
              </span>
              <span className="text-[10px] text-slate-700">·</span>
              <span className="text-[10px] text-slate-600 tracking-wider">
                #{ticket.refId}
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-200 leading-snug">
              {ticket.request_type}
            </h3>
          </div>
          <span
            className={`text-[10px] uppercase tracking-widest shrink-0 ${sc.color}`}
          >
            {sc.label}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-[11px] text-slate-600 mb-4">
          <span>{formattedDate}</span>
          {ticket.completeDueAt && (
            <span className="text-amber-500/60">
              Due{" "}
              {new Date(ticket.completeDueAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Hide / Unhide*/}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
          >
            {expanded ? "Hide" : "Details"}
          </button>

          <button
            type="button"
            onClick={() => setIsDiscussionOpen(true)}
            className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
          >
            Comments
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
              { label: "Raised By", value: raisedByName },
              { label: "Accepted By", value: acceptedByName ?? "-" },
              { label: "Created", value: formattedDate },
              {
                label: "Accepted At",
                value: ticket.acceptedAt
                  ? new Date(ticket.acceptedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "-",
              },
              {
                label: "Accept Due",
                value: ticket.acceptDueAt
                  ? new Date(ticket.acceptDueAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "-",
              },
              {
                label: "Complete Due",
                value: ticket.completeDueAt
                  ? new Date(ticket.completeDueAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "-",
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-0.5">
                  {label}
                </p>
                <p className="text-xs text-slate-400">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isDiscussionOpen && user?.id && (
        <DiscussionModal
          kind="ticket"
          refId={ticket.refId}
          userId={user.id}
          title={ticket.request_type}
          onClose={() => setIsDiscussionOpen(false)}
        />
      )}
    </div>
  );
}
