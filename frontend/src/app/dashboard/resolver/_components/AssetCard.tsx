"use client";

import { useEffect, useState } from "react";
import { Asset } from "@/types/asset";
import { GetUserById } from "@/api/user";

interface AssetCardProps {
  asset: Asset;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
  expanded: boolean;
  onToggle: () => void;
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

export default function AssetCard({
  asset,
  onAccept,
  onComplete,
  expanded,
  onToggle,
}: AssetCardProps) {
  const [raisedByName, setRaisedByName] = useState<string>("--");
  const sc = statusConfig[asset.status] ?? statusConfig["pending"];
  const accent = statusAccent[asset.status] ?? "border-l-slate-700";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await GetUserById(asset.raised_by);
        setRaisedByName(user.userName);
      } catch (e) {
        console.error("Error for ticket card is:", e);
      }
    };
    fetchData();
  }, [asset.raised_by]);

  const formattedDate = new Date(asset.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        if (asset.raised_by) {
          const user = await GetUserById(asset.raised_by);
          setRaisedByName(user.userName);
        }
        if (asset.accepted_by) {
          const user = await GetUserById(asset.accepted_by);
          setAcceptedByName(user.userName);
        }
      } catch (error) {
        console.error("Error fetching user names:", error);
      }
    };

    fetchUserNames();
  }, [asset.raised_by, asset.accepted_by]);

  return (
    <div
      className={`bg-[#0d1117] border border-slate-800 border-l-2 ${accent} hover:border-slate-700 transition-all duration-200`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] text-slate-600 tracking-widest uppercase">
                {asset.kind}
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-200 leading-snug">
              {asset.request_type}
            </h3>
          </div>
          <span
            className={`text-[10px] uppercase tracking-widest shrink-0 ${sc.color}`}
          >
            {sc.label}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-600 mb-4">
          <span>{formattedDate}</span>
          {asset.completeDueAt && (
            <span className="text-amber-500/60">
              Due{" "}
              {new Date(asset.completeDueAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={onToggle}
            className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
          >
            {expanded ? "Hide" : "Details"}
          </button>
          <div className="flex-1" />
          {asset.status === "pending" && (
            <button
              onClick={() => onAccept?.(asset.refId)}
              className="text-[15px] uppercase tracking-widest text-cyan-400 hover:text-black transition-colors hover:font-bold hover:border-cyan-400/60 hover:border-2 hover:bg-cyan-400"
            >
              Mark Accept →
            </button>
          )}
          {asset.status === "accepted" && (
            <button
              onClick={() => onComplete?.(asset.refId)}
              className="text-[15px] uppercase tracking-widest text-emerald-400 hover:text-black transition-colors hover:font-bold hover:border-emerald-400/60 hover:border-2 hover:bg-emerald-400"
            >
              Mark Complete →
            </button>
          )}
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-x-6 gap-y-3">
            {[
              { label: "Raised By", value: raisedByName },
              { label: "Created", value: formattedDate },
              {
                label: "Accepted At",
                value: asset.acceptedAt
                  ? new Date(asset.acceptedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—",
              },
              {
                label: "Accept Due",
                value: asset.acceptDueAt
                  ? new Date(asset.acceptDueAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—",
              },
              {
                label: "Complete Due",
                value: asset.completeDueAt
                  ? new Date(asset.completeDueAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—",
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
    </div>
  );
}
