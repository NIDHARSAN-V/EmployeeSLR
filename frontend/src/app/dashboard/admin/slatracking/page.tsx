"use client";

import { useEffect, useState } from "react";
import { GetBreachedResourceForAdmin, BreachedItem } from "@/api/sla";
import { GetUserById } from "@/api/user";

import { Ticket } from "@/types/ticket";
import { Asset } from "@/types/asset";
import { useAuth } from "@/context/AuthContext";

export default function SLATrackingPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<BreachedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "ticket" | "asset">(
    "all",
  );

  useEffect(() => {
    
    const fetchBreachedResources = async () => {
      try {
        const breachedResources = await GetBreachedResourceForAdmin(
          user?.id || "",
        );

        
        const breached: BreachedItem[] = breachedResources
          .map((item: Ticket | Asset) => {
            const isTicket = "ticket" in item && item.ticket ? true : false;
            return {
              ...item,
              _kind: isTicket ? ("ticket" as const) : ("asset" as const),
            };
          })
          .sort((a, b) => {
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bDate - aDate;
          });
        setItems(breached);
        
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBreachedResources();
  }, [user?.id]);

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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Admin Console
          </span>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
            SLA Tracking
          </span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">
              SLA Breach Tracking
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              <span className="text-amber-400">{ticketCount}</span> tickets ·{" "}
              <span className="text-cyan-400">{assetCount}</span> assets
              resolved
            </p>
          </div>
          {/* <div className="flex items-center gap-2">
            <a
              href="/dashboard/resolver/tickets"
              className="text-xs font-mono px-3 py-1.5 rounded border border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-400/30 transition-colors uppercase tracking-wider"
            >
              ← Tickets
            </a>
            <a
              href="/dashboard/resolver/assets"
              className="text-xs font-mono px-3 py-1.5 rounded border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-colors uppercase tracking-wider"
            >
              ← Assets
            </a>
          </div> */}
        </div>
      </div>

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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search Breached Issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-colors"
          />
        </div>

        {/* Kind tabs */}
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
          <p className="text-slate-400 font-medium">No Breached items yet</p>
          <p className="text-xs text-slate-600 font-mono mt-1">
            Breached tickets and assets will appear here
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden">
          <div className="divide-y divide-slate-800/60">
            {filtered.map((item) => (
              <BreachedRow key={item.refId} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BreachedRow({ item }: { item: BreachedItem }) {
  const [expanded, setExpanded] = useState(false);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [loadingNames, setLoadingNames] = useState(true);

  const isAcceptDeadline = (item as any).deadlineType === "ACCEPT_DEADLINE";
  const isCompleteDeadline = (item as any).deadlineType === "COMPLETE_DEADLINE";

  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const names: { [key: string]: string } = {};

        // Fetch raised_by user
        if (item.raised_by) {
          try {
            const user = await GetUserById(item.raised_by);
            names[item.raised_by] = user?.userName || item.raised_by;
          } catch {
            names[item.raised_by] = item.raised_by;
          }
        }

        // Fetch accepted_by user
        if ((item as any).accepted_by) {
          try {
            const user = await GetUserById((item as any).accepted_by);
            names[(item as any).accepted_by] = user?.userName || (item as any).accepted_by;
          } catch {
            names[(item as any).accepted_by] = (item as any).accepted_by;
          }
        }

        // Fetch completed_by user
        if ((item as any).completed_by) {
          try {
            const user = await GetUserById((item as any).completed_by);
            names[(item as any).completed_by] = user?.userName || (item as any).completed_by;
          } catch {
            names[(item as any).completed_by] = (item as any).completed_by;
          }
        }

        setUserNames(names);
      } catch (error) {
        console.error("Error fetching user names:", error);
      } finally {
        setLoadingNames(false);
      }
    };

    fetchUserNames();
  }, [item]);

  const deadlineDate = isAcceptDeadline ? item.acceptDueAt : item.completeDueAt;
  const deadlineDateFormatted = deadlineDate
    ? new Date(deadlineDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const createdDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="px-4 py-3 hover:bg-slate-800/40 transition-colors">
      <div className="flex items-center gap-4">
        {/* Kind badge */}
        <div
          className={`shrink-0 w-14 text-center text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border ${
            item._kind === "ticket"
              ? "text-amber-400 bg-amber-400/10 border-amber-400/30"
              : "text-cyan-400 bg-cyan-400/10 border-cyan-400/30"
          }`}
        >
          {item._kind}
        </div>

        {/* Request type */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 truncate">{item.request_type}</p>
          <p className="text-[10px] font-mono text-slate-600 mt-0.5">
            #{item.refId}
          </p>
        </div>

        {/* Deadline Type Badge */}
        <div
          className={`shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border ${
            isAcceptDeadline
              ? "text-orange-400 bg-orange-400/10 border-orange-400/30"
              : "text-red-400 bg-red-400/10 border-red-400/30"
          }`}
        >
          {isAcceptDeadline ? "Accept Due" : "Complete Due"}
        </div>

        {/* Deadline at */}
        <p className="shrink-0 text-xs font-mono text-slate-500 hidden sm:block">
          {deadlineDateFormatted}
        </p>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 text-[10px] font-mono text-slate-600 hover:text-slate-300 transition-colors uppercase tracking-wider"
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Request Status", value: item.status || "—" },
            {
              label: "Raised By",
              value: loadingNames ? "Loading..." : userNames[item.raised_by] || item.raised_by,
            },
            ...(isAcceptDeadline
              ? [
                  {
                    label: "Accept Due At",
                    value: deadlineDateFormatted,
                  },
                  {
                    label: "Created At",
                    value: createdDate,
                  },
                ]
              : [
                  {
                    label: "Accepted By",
                    value: loadingNames
                      ? "Loading..."
                      : userNames[(item as any).accepted_by] ||
                        (item as any).accepted_by ||
                        "—",
                  },
                  {
                    label: "Accepted At",
                    value: (item as any).acceptedAt
                      ? new Date((item as any).acceptedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—",
                  },
                  {
                    label: "Complete Due At",
                    value: deadlineDateFormatted,
                  },
                  {
                    label: "Created At",
                    value: createdDate,
                  },
                ]),
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
