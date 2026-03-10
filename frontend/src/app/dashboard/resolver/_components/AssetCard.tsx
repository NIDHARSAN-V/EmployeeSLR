"use client";

import { useEffect, useState } from "react";
import { Asset } from "@/types/asset";
import { Content } from "@/types/content";
import { GetMessages } from "@/api/content";

interface AssetCardProps {
  asset: Asset;
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

export default function AssetCard({ asset, onAccept, onComplete }: AssetCardProps) {
  const [messages, setMessages] = useState<Content | null>(null);
  const [expanded, setExpanded] = useState(false);
  const sc = statusConfig[asset.status] ?? statusConfig["pending"];
  const accent = statusAccent[asset.status] ?? "border-l-slate-700";

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const allAssets = await GetMessages("asset", asset.refId);
        setMessages(allAssets);
      } catch {
        setMessages(null);
      }
    };
    fetchAssets();
  }, [asset.refId]);

  const formattedDate = new Date(asset.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className={`bg-[#0d1117] border border-slate-800 border-l-2 ${accent} hover:border-slate-700 transition-all duration-200`}>
      <div className="p-4">

        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] text-slate-600 tracking-widest uppercase">{asset.kind}</span>
              <span className="text-[10px] text-slate-700">·</span>
              <span className="text-[10px] text-slate-600 tracking-wider">#{asset.refId}</span>
            </div>
            <h3 className="text-sm font-medium text-slate-200 leading-snug">{asset.request_type}</h3>
          </div>
          <span className={`text-[10px] uppercase tracking-widest shrink-0 ${sc.color}`}>
            {sc.label}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-[11px] text-slate-600 mb-4">
          <span>{formattedDate}</span>
          {asset.completeDueAt && (
            <span className="text-amber-500/60">
              Due {new Date(asset.completeDueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
          >
            {expanded ? "Hide" : "Details"}
          </button>

          <div className="flex-1" />

          {asset.status === "pending" && (
            <button
              onClick={() => onAccept?.(asset.refId)}
              className="text-[11px] uppercase tracking-widest text-sky-400 hover:text-sky-300 transition-colors"
            >
              Accept →
            </button>
          )}
          {asset.status === "accepted" && (
            <button
              onClick={() => onComplete?.(asset.refId)}
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
              { label: "Raised By", value: asset.raised_by },
              { label: "Accepted By", value: asset.accepted_by ?? "—" },
              { label: "Created", value: formattedDate },
              { label: "Accepted At", value: asset.acceptedAt ? new Date(asset.acceptedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
              { label: "Accept Due", value: asset.acceptDueAt ? new Date(asset.acceptDueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—" },
              { label: "Complete Due", value: asset.completeDueAt ? new Date(asset.completeDueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—" },
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
              <div className="text-[10px] text-slate-500 italic">No comments for this asset</div>
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