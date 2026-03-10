"use client";

import { useEffect, useState } from "react";
import { GetAllTickets } from "@/api/ticket";
import { GetAllAssets } from "@/api/asset";
import { Ticket } from "@/types/ticket";
import { Asset } from "@/types/asset";
import { useAuth } from "@/context/AuthContext";
import { GetUserById } from "@/api/user";

type HistoryItem = (Ticket | Asset) & { _kind: "ticket" | "asset" };

export default function HistoryPage() {
  const { user } = useAuth();
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "ticket" | "asset">(
    "all",
  );
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      try {
        const [tickets, assets] = await Promise.all([
          GetAllTickets(),
          GetAllAssets(),
        ]);
        const completed: HistoryItem[] = [
          ...tickets
            .filter(
              (t) => t.status === "completed" && t.completed_by === user?.id,
            )
            .map((t) => ({ ...t, _kind: "ticket" as const })),
          ...assets
            .filter(
              (a) => a.status === "completed" && a.completed_by === user?.id,
            )
            .map((a) => ({ ...a, _kind: "asset" as const })),
        ].sort((a, b) => {
          const aDate = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const bDate = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return bDate - aDate;
        });
        setItems(completed);

        // Fetch user names for raised_by
        const uniqueRaisedBy = [
          ...new Set(completed.map((item) => item.raised_by)),
        ].filter((id) => id);
        if (uniqueRaisedBy.length > 0) {
          const userDetails = await Promise.all(
            uniqueRaisedBy.map((id) => GetUserById(id)),
          );
          const namesMap = userDetails.reduce(
            (acc, detail) => ({ ...acc, [detail.id]: detail.userName }),
            {},
          );
          setUserNames(namesMap);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const filtered = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.request_type.toLowerCase().includes(search.toLowerCase()) ||
      item.refId.toLowerCase().includes(search.toLowerCase()) ||
      item.raised_by.toLowerCase().includes(search.toLowerCase());
    const matchesKind = kindFilter === "all" || item._kind === kindFilter;
    return matchesSearch && matchesKind;
  });

  const ticketCount = items.filter((i) => i._kind === "ticket").length;
  const assetCount = items.filter((i) => i._kind === "asset").length;

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 font-mono text-sm animate-pulse">
          Loading history...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 font-sans">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Resolver Console
          </span>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
            History
          </span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">
              Completed Work
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              <span className="text-amber-400">{ticketCount}</span> tickets ·{" "}
              <span className="text-cyan-400">{assetCount}</span> assets
              resolved
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/60 rounded-lg p-1">
          {(["all", "ticket", "asset"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded transition-all duration-150 ${
                kindFilter === k
                  ? "bg-emerald-400 text-slate-950 font-bold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {k === "all" ? "All" : k === "ticket" ? "Tickets" : "Assets"}
            </button>
          ))}
        </div>

        <p className="text-xs font-mono text-slate-600 whitespace-nowrap ml-auto">
          {filtered.length === items.length
            ? `${items.length} items`
            : `${filtered.length} of ${items.length}`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-slate-400 font-medium">No completed items yet</p>
          <p className="text-xs text-slate-600 font-mono mt-1">
            Completed tickets and assets will appear here
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden">
          <div className="divide-y divide-slate-800/60">
            {filtered.map((item) => (
              <HistoryRow
                key={item.refId}
                item={item}
                userNames={userNames}
                expanded={expandedItem === item.refId}
                onToggle={() =>
                  setExpandedItem(
                    expandedItem === item.refId ? null : item.refId,
                  )
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryRow({
  item,
  userNames,
  expanded,
  onToggle,
}: {
  item: HistoryItem;
  userNames: Record<string, string>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const completedDate = item.completedAt
    ? new Date(item.completedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const createdDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="px-4 py-3 hover:bg-slate-800/40 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`shrink-0 w-14 text-center text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border ${
            item._kind === "ticket"
              ? "text-amber-400 bg-amber-400/10 border-amber-400/30"
              : "text-cyan-400 bg-cyan-400/10 border-cyan-400/30"
          }`}
        >
          {item._kind}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 truncate">{item.request_type}</p>
        </div>

        <div className="shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border text-emerald-400 bg-emerald-400/10 border-emerald-400/30">
          Completed
        </div>

        <p className="shrink-0 text-xs font-mono text-slate-500 hidden sm:block">
          {completedDate}
        </p>

        <button
          onClick={onToggle}
          className="shrink-0 text-[10px] font-mono text-slate-600 hover:text-slate-300 transition-colors uppercase tracking-wider"
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Raised By", value: userNames[item.raised_by] || "—" },
            { label: "Created", value: createdDate },
            {
              label: "Accepted At",
              value: item.acceptedAt
                ? new Date(item.acceptedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—",
            },
            { label: "Completed At", value: completedDate },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-0.5">
                {label}
              </p>
              <p className="text-xs text-slate-400 font-mono truncate">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
