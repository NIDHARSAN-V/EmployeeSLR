"use client";

import { useState } from "react";

export interface Asset {
  id: string;
  name: string;
  description: string;
  type: "hardware" | "software" | "peripheral" | "furniture" | "other";
  status: "pending" | "approved" | "in_transit" | "delivered" | "rejected";
  requester: string;
  requestedAt: string;
  updatedAt: string;
  urgency: "standard" | "urgent";
  quantity: number;
  estimatedCost?: string;
  vendor?: string;
  notes?: string;
}

interface AssetCardProps {
  asset: Asset;
  onStatusChange?: (id: string, status: Asset["status"]) => void;
}

const typeConfig = {
  hardware: { label: "Hardware", icon: "🖥", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30" },
  software: { label: "Software", icon: "💾", color: "text-violet-400 bg-violet-400/10 border-violet-400/30" },
  peripheral: { label: "Peripheral", icon: "🖱", color: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
  furniture: { label: "Furniture", icon: "🪑", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  other: { label: "Other", icon: "📦", color: "text-slate-400 bg-slate-400/10 border-slate-400/30" },
};

const statusConfig = {
  pending: { label: "Pending", class: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  approved: { label: "Approved", class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
  in_transit: { label: "In Transit", class: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
  delivered: { label: "Delivered", class: "text-slate-400 bg-slate-400/10 border-slate-400/30" },
  rejected: { label: "Rejected", class: "text-red-400 bg-red-400/10 border-red-400/30" },
};

const typeIconBg = {
  hardware: "bg-cyan-400/10",
  software: "bg-violet-400/10",
  peripheral: "bg-sky-400/10",
  furniture: "bg-amber-400/10",
  other: "bg-slate-400/10",
};

export default function AssetCard({ asset, onStatusChange }: AssetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const tc = typeConfig[asset.type];
  const sc = statusConfig[asset.status];

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden transition-all duration-200 hover:border-slate-600/80 hover:shadow-lg hover:shadow-black/20">
      <div className="p-4">
        {/* Icon + Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${typeIconBg[asset.type]} flex items-center justify-center text-xl`}>
            {tc.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[10px] font-mono text-slate-600">#{asset.id}</span>
              {asset.urgency === "urgent" && (
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border text-orange-400 bg-orange-400/10 border-orange-400/30">
                  Urgent
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-200 leading-snug">{asset.name}</h3>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${tc.color}`}>
            {tc.label}
          </span>
          <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${sc.class}`}>
            {sc.label}
          </span>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            Qty: {asset.quantity}
          </span>
          {asset.estimatedCost && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              {asset.estimatedCost}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
          {asset.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-600">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{asset.requester}</span>
          </div>
          <span>{asset.updatedAt}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider"
          >
            {expanded ? "▲ Collapse" : "▼ Details"}
          </button>
          <div className="flex-1" />
          {asset.status === "pending" && (
            <>
              <button
                onClick={() => onStatusChange?.(asset.id, "approved")}
                className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/20 transition-colors uppercase tracking-wider"
              >
                Approve
              </button>
              <button
                onClick={() => onStatusChange?.(asset.id, "rejected")}
                className="text-[10px] font-mono px-2.5 py-1 rounded bg-red-400/10 text-red-400 border border-red-400/30 hover:bg-red-400/20 transition-colors uppercase tracking-wider"
              >
                Reject
              </button>
            </>
          )}
          {asset.status === "approved" && (
            <button
              onClick={() => onStatusChange?.(asset.id, "in_transit")}
              className="text-[10px] font-mono px-2.5 py-1 rounded bg-sky-400/10 text-sky-400 border border-sky-400/30 hover:bg-sky-400/20 transition-colors uppercase tracking-wider"
            >
              Mark In Transit
            </button>
          )}
          {asset.status === "in_transit" && (
            <button
              onClick={() => onStatusChange?.(asset.id, "delivered")}
              className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-400/10 text-slate-300 border border-slate-600 hover:bg-slate-700 transition-colors uppercase tracking-wider"
            >
              Confirm Delivery
            </button>
          )}
          <button className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 transition-colors uppercase tracking-wider">
            View →
          </button>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Requested", value: asset.requestedAt },
                { label: "Vendor", value: asset.vendor ?? "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-xs text-slate-400 font-mono">{value}</p>
                </div>
              ))}
            </div>
            {asset.notes && (
              <div>
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-0.5">Notes</p>
                <p className="text-xs text-slate-400 leading-relaxed">{asset.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
