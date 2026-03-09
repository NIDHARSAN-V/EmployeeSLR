

import { Asset } from "./AssetCard";

interface AssetPipelineProps {
  assets: Asset[];
}

const STAGES: { key: Asset["status"]; label: string; color: string }[] = [
  { key: "pending", label: "Pending", color: "text-amber-400" },
  { key: "approved", label: "Approved", color: "text-emerald-400" },
  { key: "in_transit", label: "In Transit", color: "text-sky-400" },
  { key: "delivered", label: "Delivered", color: "text-slate-500" },
];

export default function AssetPipeline({ assets }: AssetPipelineProps) {
  const counts = STAGES.map((s) => ({
    ...s,
    count: assets.filter((a) => a.status === s.key).length,
  }));
  const total = assets.filter((a) => a.status !== "rejected").length || 1;

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-lg p-4 mb-6">
      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-4">
        Asset Pipeline
      </p>
      <div className="flex items-center gap-0 mb-3 overflow-hidden rounded-full h-2">
        {counts.map((s, i) => (
          <div
            key={s.key}
            className={`h-full transition-all ${
              s.key === "pending" ? "bg-amber-400" :
              s.key === "approved" ? "bg-emerald-400" :
              s.key === "in_transit" ? "bg-sky-400" :
              "bg-slate-600"
            } ${i === 0 ? "" : "border-l border-slate-950"}`}
            style={{ width: `${(s.count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {counts.map((s) => (
          <div key={s.key} className="text-center">
            <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.count}</p>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
