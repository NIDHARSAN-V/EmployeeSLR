"use client";

interface AssetFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  statusTabs?: string[];
  totalCount: number;
  filteredCount: number;
}

const ALL_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
];

export default function AssetFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusTabs = ["all", "pending", "accepted", "completed"],
  totalCount,
  filteredCount,
}: AssetFiltersProps) {
  const options = ALL_STATUS_OPTIONS.filter((o) => statusTabs.includes(o.value));

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      <div className="relative flex-1 w-full sm:max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 font-mono focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-colors"
        />
      </div>

      <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/60 rounded-lg p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded transition-all duration-150 ${
              statusFilter === opt.value
                ? "bg-cyan-400 text-slate-950 font-bold"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="text-xs font-mono text-slate-600 whitespace-nowrap ml-auto">
        {filteredCount === totalCount ? `${totalCount} assets` : `${filteredCount} of ${totalCount}`}
      </p>
    </div>
  );
}
