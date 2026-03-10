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

const STATUS_OPTIONS = [
  { value: "all",       label: "All",       dot: "bg-slate-500" },
  { value: "pending",   label: "Pending",   dot: "bg-amber-400" },
  { value: "accepted",  label: "Accepted",  dot: "bg-sky-400" },
  { value: "completed", label: "Completed", dot: "bg-emerald-400" },
];

export default function AssetFilters({
  search, onSearchChange, statusFilter, onStatusChange,
  statusTabs = ["all", "pending", "accepted", "completed"],
  totalCount, filteredCount,
}: AssetFiltersProps) {
  const options = STATUS_OPTIONS.filter((o) => statusTabs.includes(o.value));

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
      <div className="relative w-full sm:max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by title, ID, employee..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#0d1117] border-b border-slate-700 pl-9 pr-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-400 transition-colors"
        />
      </div>

      <div className="flex items-center gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-widest transition-all duration-150 ${
              statusFilter === opt.value ? "text-white" : "text-slate-600 hover:text-slate-400"
            }`}
          >
            {statusFilter === opt.value && (
              <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
            )}
            {opt.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-700 ml-auto tabular-nums">
        {filteredCount === totalCount ? totalCount : `${filteredCount}/${totalCount}`}
      </p>
    </div>
  );
}