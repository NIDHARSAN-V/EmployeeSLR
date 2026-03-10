"use client";

import { useEffect, useState } from "react";
import AssetCard from "../_components/AssetCard";
import AssetFilters from "../_components/AssetFilters";
import { GetAllAssets, AcceptAsset, CompleteAsset } from "@/api/asset";
import { Asset } from "@/types/asset";
import { useAuth } from "@/context/AuthContext";

export default function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const allAssets = await GetAllAssets();
        setAssets(
          allAssets.filter(
            (a) => a.accepted_by === user?.id && a.status !== "completed",
          ),
        );
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
      setAssets((prev) =>
        prev.map((a) => (a.refId === id ? { ...a, ...updated } : a)),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (id: string) => {
    if (!user?.id) return;
    try {
      await CompleteAsset(id, user.id);
      setAssets((prev) => prev.filter((a) => a.refId !== id));
    } catch (e) {
      console.error(e);
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
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <p className="text-slate-700 text-xs uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen text-slate-100 p-6 lg:p-10">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-3">
          Resolver Console / Assets
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">
              Asset Requests
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              <span className="text-amber-400/80">{counts.pending}</span>{" "}
              pending &nbsp;
              <span className="text-slate-700">·</span>&nbsp;
              <span className="text-sky-400/80">{counts.accepted}</span> in
              progress
            </p>
          </div>
        </div>
      </div>

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
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-slate-600 text-sm">No assets match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.refId}
              id={asset.refId}
              asset={asset}
              onAccept={handleAccept}
              onComplete={handleComplete}
              expanded={expandedAsset === asset.refId}
              onToggle={() =>
                setExpandedAsset(
                  expandedAsset === asset.refId ? null : asset.refId,
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
