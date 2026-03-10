"use client";

import { useState } from "react";
import DiscussionModal from "./DiscussionModal";

export type LogItem = {
  refId: string;
  kind: "ticket" | "asset";
  request_type: string;
  status: "pending" | "accepted" | "completed";
  raised_by: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  accepted: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
};

export default function LogView({
  tickets,
  userId,
}: {
  tickets: LogItem[];
  userId: string;
}) {
  const [activeDiscussion, setActiveDiscussion] = useState<{
    kind: "ticket" | "asset";
    refId: string;
  } | null>(null);

  const openDiscussion = (kind: "ticket" | "asset", refId: string) => {
    setActiveDiscussion({ kind, refId });
  };

  return (
    <div className="max-w-5xl mx-auto px-4">

      {/* Heading */}
      {tickets.length > 0 && (
        <h2 className="text-2xl font-bold text-slate-100 mb-8">
          {tickets[0].kind === "ticket" ? "Your Ticket History" : "Your Asset History"}
        </h2>
      )}

      {tickets.length === 0 && (
        <p className="text-slate-500 font-mono">No activity yet.</p>
      )}

      <div className="space-y-4">
        {tickets.map((item) => (
          <div
            key={item.refId}
            className="bg-slate-900 border border-slate-700 rounded-lg p-5 shadow-sm hover:border-slate-500 transition-all"
          >
            {/* Top Row */}
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    #{item.refId}
                  </span>

                  <span
                    className={`text-[10px] px-2 py-1 rounded border font-mono uppercase tracking-wider ${
                      statusColors[item.status]
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    {item.kind}
                  </span>
                </div>

                <h4 className="text-slate-200 font-semibold mt-2 capitalize">
                  {item.request_type.replace("_", " ")}
                </h4>
              </div>
            </div>

            {/* Date */}
            <p className="text-xs font-mono text-slate-500 mt-3">
              {new Date(item.createdAt).toLocaleString()}
            </p>

            {/* Discussion Button */}
            <button
              onClick={() => openDiscussion(item.kind, item.refId)}
              className="mt-4 text-cyan-400 font-mono text-xs underline hover:text-cyan-300"
            >
              💬 Discussion
            </button>
          </div>
        ))}
      </div>

      {/* Discussion Modal */}
      {activeDiscussion && (
        <DiscussionModal
          kind={activeDiscussion.kind}
          refId={activeDiscussion.refId}
          userId={userId}
          onClose={() => setActiveDiscussion(null)}
        />
      )}
    </div>
  );
}