"use client";

import { useState } from "react";
import AssetCard, { Asset } from "../_components/AssetCard";
import AssetPipeline from "../_components/AssetPipeline";

const MOCK_ASSETS: Asset[] = [
  {
    id: "AST-0045",
    name: "Dell UltraSharp 27\" 4K Monitor",
    description: "Replacement monitor for design workstation. Previous unit has backlight bleed affecting color accuracy on design projects.",
    type: "hardware",
    status: "pending",
    requester: "priya.s@corp.io",
    requestedAt: "28 Feb 2026, 09:45",
    updatedAt: "18m ago",
    urgency: "standard",
    quantity: 1,
    estimatedCost: "₹32,000",
    vendor: "Dell India",
    notes: "Prefers the U2723QE model. Finance pre-approved up to ₹35,000.",
  },
  {
    id: "AST-0044",
    name: "Ergonomic Standing Desk",
    description: "Height-adjustable standing desk for relocated finance team employee. Current fixed-height desk does not accommodate ergonomic requirements.",
    type: "furniture",
    status: "in_transit",
    requester: "finance@corp.io",
    requestedAt: "26 Feb 2026, 14:20",
    updatedAt: "2h ago",
    urgency: "standard",
    quantity: 1,
    estimatedCost: "₹18,500",
    vendor: "Godrej Interio",
    notes: "Tracking ID: GI-2026-00392. Expected delivery Friday.",
  },
  {
    id: "AST-0043",
    name: "Microsoft 365 Business Standard License",
    description: "Additional license seat for new hire starting next week. Need to provision before onboarding date.",
    type: "software",
    status: "approved",
    requester: "hr@corp.io",
    requestedAt: "25 Feb 2026, 11:00",
    updatedAt: "Yesterday",
    urgency: "urgent",
    quantity: 1,
    estimatedCost: "₹1,200/mo",
    vendor: "Microsoft",
  },
  {
    id: "AST-0042",
    name: "Logitech MX Keys Keyboard + MX Master 3 Mouse",
    description: "Wireless keyboard and mouse combo for developer workstation. Current peripherals are 4 years old and showing significant wear.",
    type: "peripheral",
    status: "delivered",
    requester: "dev.team@corp.io",
    requestedAt: "20 Feb 2026, 10:00",
    updatedAt: "2 days ago",
    urgency: "standard",
    quantity: 2,
    estimatedCost: "₹14,000",
    vendor: "Logitech Reseller",
    notes: "Delivered and distributed. Asset tags applied: AT-2026-0091, AT-2026-0092.",
  },
  {
    id: "AST-0041",
    name: "USB-C Docking Station — Lenovo ThinkPad",
    description: "4-port USB-C dock for ThinkPad E15 used in conference room. Current setup requires multiple cables and lacks display output.",
    type: "peripheral",
    status: "pending",
    requester: "ops@corp.io",
    requestedAt: "27 Feb 2026, 16:00",
    updatedAt: "Yesterday",
    urgency: "urgent",
    quantity: 2,
    estimatedCost: "₹9,800",
    vendor: "Lenovo India",
  },
  {
    id: "AST-0040",
    name: "Adobe Creative Cloud All Apps License",
    description: "Annual CC license for new design contractor joining next month. Needs full suite access including Premiere Pro.",
    type: "software",
    status: "rejected",
    requester: "design@corp.io",
    requestedAt: "22 Feb 2026, 09:30",
    updatedAt: "3 days ago",
    urgency: "standard",
    quantity: 1,
    estimatedCost: "₹54,000/yr",
    vendor: "Adobe",
    notes: "Rejected — contractor should use client-provided license per contract terms. Requester informed.",
  },
];

const TYPE_OPTIONS = ["all", "hardware", "software", "peripheral", "furniture", "other"] as const;
const STATUS_OPTIONS = ["all", "pending", "approved", "in_transit", "delivered", "rejected"] as const;

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleStatusChange = (id: string, newStatus: Asset["status"]) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const filtered = assets.filter((a) => {
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.requester.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "all" || a.type === typeFilter;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const pendingCount = assets.filter((a) => a.status === "pending").length;
  const urgentCount = assets.filter((a) => a.urgency === "urgent").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Resolver Console
          </span>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
            Assets
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">
              Asset Requests
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              <span className="text-amber-400">{pendingCount}</span> pending review ·{" "}
              {urgentCount > 0 && (
                <span className="text-orange-400">{urgentCount} urgent</span>
              )}
            </p>
          </div>
          <button className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Request
          </button>
        </div>
      </div>

      {/* Pipeline bar */}
      <AssetPipeline assets={assets} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        {/* Search */}
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
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 font-mono focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-colors"
          />
        </div>

        {/* Type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs font-mono text-slate-400 focus:outline-none focus:border-cyan-400/50 transition-colors cursor-pointer capitalize"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/60 rounded-lg p-1 overflow-x-auto">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded whitespace-nowrap transition-all duration-150 ${
                statusFilter === s
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {s === "in_transit" ? "In Transit" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <p className="text-xs font-mono text-slate-600 whitespace-nowrap ml-auto">
          {filtered.length === assets.length
            ? `${assets.length} requests`
            : `${filtered.length} of ${assets.length}`}
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-slate-400 font-medium">No asset requests match your filters</p>
          <p className="text-xs text-slate-600 font-mono mt-1">Adjust your filters or create a new request</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
