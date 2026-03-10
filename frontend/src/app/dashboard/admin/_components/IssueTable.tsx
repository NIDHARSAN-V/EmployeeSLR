"use client";

import { Ticket } from "@/types/ticket";
import { Eye } from "lucide-react";
import { useState } from "react";

interface IssueTableProps {
  items: Ticket[];
  onViewDetails?: (id: string) => void;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  accepted: { label: "Accepted", class: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
  completed: { label: "Completed", class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
};

export default function IssueTable({ items, onViewDetails }: IssueTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700/60 bg-slate-900">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-800/50 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/60">
          <tr>
            <th className="px-6 py-4 font-mono font-semibold">Issues</th>
            <th className="px-6 py-4 font-mono font-semibold">Status</th>
            <th className="px-6 py-4 font-mono font-semibold">Raised By</th>
            <th className="px-6 py-4 font-mono font-semibold">Completed By</th>
            <th className="px-6 py-4 text-right font-mono font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-700/40">
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-8 text-center text-sm text-slate-500 font-mono"
              >
                No issues to display.
              </td>
            </tr>
          ) : (
            items.map((row) => {
              const sc = statusConfig[row.status] ?? statusConfig["pending"];
              const isHovered = hoveredRow === row.refId;

              return (
                <tr
                  key={row.refId}
                  className="transition-colors duration-150 hover:bg-slate-800/40 border-slate-700/30"
                  onMouseEnter={() => setHoveredRow(row.refId)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Issues Column */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">#{row.refId}</span>
                      <span className="text-sm text-slate-200 font-medium">{row.request_type}</span>
                      <span className="text-[10px] font-mono text-slate-600">{row.kind}</span>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded border ${sc.class}`}
                    >
                      {sc.label}
                    </span>
                  </td>

                  {/* Raised By Column */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300 font-mono">{row.raised_by || "—"}</span>
                  </td>

                  {/* Completed By Column */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300 font-mono">
                      {row.status === "completed" ? (row.accepted_by || "—") : "—"}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onViewDetails?.(row.refId)}
                      className={`inline-flex items-center justify-center p-2 rounded transition-all duration-150 ${
                        isHovered
                          ? "text-sky-400 bg-sky-400/10 border border-sky-400/30"
                          : "text-slate-500 hover:text-sky-400 hover:bg-sky-400/10 hover:border hover:border-sky-400/30"
                      }`}
                      aria-label="View issue details"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
