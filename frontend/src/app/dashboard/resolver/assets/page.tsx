"use client";

import { useEffect, useState } from "react";
import AssetCard from "../_components/AssetCard";
import AssetFilters from "../_components/AssetFilters";
import AssetPipeline from "../_components/AssetPipeline";
import { GetAllAssets, AcceptAsset, CompleteAsset } from "@/api/asset";
import { Asset } from "@/types/asset";
import { useAuth } from "@/context/AuthContext";

export default function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const allAssets = await GetAllAssets();
        // Completed assets live in /history — exclude them here
        setAssets(allAssets.filter((a) => a.status !== "completed"));
      } catch {
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [user?.id]);

  const handleAccept = async (id: string) => {
    if (!user?.id) return;
    try {
      const updated = await AcceptAsset(id, user.id);
      setAssets((prev) => prev.map((a) => (a.refId === id ? { ...a, ...updated } : a)));
    } catch (e) {
      console.error("Failed to accept asset", e);
    }
  };

  const handleComplete = async (id: string) => {
    if (!user?.id) return;
    try {
      await CompleteAsset(id, user.id);
      // Remove from active queue — it now lives in history
      setAssets((prev) => prev.filter((a) => a.refId !== id));
    } catch (e) {
      console.error("Failed to complete asset", e);
    }
  };

  const filtered = assets.filter((a) => {
    const matchesSearch =
      !search ||
      a.request_type.toLowerCase().includes(search.toLowerCase()) ||
      a.refId.toLowerCase().includes(search.toLowerCase()) ||
      a.kind.toLowerCase().includes(search.toLowerCase()) ||
      a.raised_by.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    pending: assets.filter((a) => a.status === "pending").length,
    accepted: assets.filter((a) => a.status === "accepted").length,
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 font-mono text-sm animate-pulse">Loading assets...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Resolver Console</span>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Assets</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">Asset Requests</h1>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              <span className="text-amber-400">{counts.pending}</span> pending ·{" "}
              <span className="text-sky-400">{counts.accepted}</span> accepted
            </p>
          </div>
          <a
            href="/dashboard/resolver/history"
            className="text-xs font-mono px-3 py-1.5 rounded border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors uppercase tracking-wider"
          >
            History →
          </a>
        </div>
      </div>

      {/* Pipeline — only pending + accepted */}
      <AssetPipeline assets={assets} />

      {/* Filters — only pending + accepted tabs */}
      <AssetFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusTabs={["all", "pending", "accepted"]}
        totalCount={assets.length}
        filteredCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-slate-400 font-medium">No assets match your filters</p>
          <p className="text-xs text-slate-600 font-mono mt-1">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.refId}
              asset={asset}
              onAccept={handleAccept}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
