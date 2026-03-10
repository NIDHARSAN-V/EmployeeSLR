import { Asset } from "@/types/asset";

interface AssetPipelineProps {
  assets: Asset[];
}

const STAGES: { key: Asset["status"]; label: string; color: string; bar: string }[] = [
  { key: "pending",   label: "Pending",   color: "text-amber-400/70",   bar: "bg-amber-400" },
  { key: "accepted",  label: "Accepted",  color: "text-sky-400/70",     bar: "bg-sky-400" },
  { key: "completed", label: "Completed", color: "text-emerald-400/70", bar: "bg-emerald-400" },
];

export default function AssetPipeline({ assets }: AssetPipelineProps) {
  const counts = STAGES.map((s) => ({
    ...s,
    count: assets.filter((a) => a.status === s.key).length,
  }));
  const total = assets.length || 1;

  return (
    <div className="mb-8">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-4">Pipeline</p>

      {/* Segmented bar */}
      <div className="flex h-[2px] mb-5 gap-0.5">
        {counts.map((s) => (
          <div
            key={s.key}
            className={`h-full transition-all ${s.bar} opacity-60`}
            style={{ width: `${(s.count / total) * 100}%` }}
          />
        ))}
        {/* Fill remainder with slate */}
        <div className="h-full flex-1 bg-slate-800" />
      </div>

      {/* Stage counts */}
      <div className="flex gap-8">
        {counts.map((s) => (
          <div key={s.key}>
            <p className={`text-xl font-semibold tabular-nums ${s.color}`}>{s.count}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}