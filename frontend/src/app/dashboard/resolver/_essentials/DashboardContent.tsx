"use client";

import { GetAllTickets } from "@/api/ticket";
import { GetAllAssets } from "@/api/asset";
import ActivityItem from "../_components/ActivityItem";
import { UserModel } from "@/types/user";
import { GetAllUsers, GetUserById } from "@/api/user";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Asset } from "@/types/asset";
import { Ticket } from "@/types/ticket";

export const  DashBoardContent = () => {
  const [currUser, setCurrUser] = useState<UserModel>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [currentUser, ticketsData, assetsData] = await Promise.all([
          GetUserById(user.id),
          GetAllTickets(),
          GetAllAssets(),
        ]);
        setCurrUser(currentUser);
        setTickets(ticketsData);
        setAssets(assetsData);
      } catch (error) {
        console.error(error);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-slate-500 font-mono text-sm animate-pulse">Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-red-400 font-mono text-sm">{error}</p>
    </div>
  );

  const pendingTickets = tickets.filter((t) => t.status === "pending");
  const completedTickets = tickets.filter((t) => t.status === "completed");
  const acceptedTickets = tickets.filter((t) => t.accepted_by === user?.id);

  const pendingAssets = assets.filter((a) => a.status === "pending");
  const completedAssets = assets.filter((a) => a.status === "completed");
  const acceptedAssets = assets.filter((a) => a.accepted_by === user?.id);

  const activityItems = [...acceptedTickets, ...acceptedAssets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-mono text-slate-100 tracking-tight">
          {greeting}, {currUser?.userName}.
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-mono">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {pendingTickets.length + pendingAssets.length > 0 && (
            <>
              {" · "}
              <span className="text-amber-400">
                {pendingTickets.length + pendingAssets.length} pending items
              </span>{" "}
              need attention
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="xl:col-span-2">
          <div className="bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  My Activity
                </span>
                <span className="text-[10px] font-mono bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded px-1.5 py-0.5">
                  {activityItems.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/dashboard/resolver/tickets"
                  className="text-xs font-mono text-slate-500 hover:text-amber-400 transition-colors"
                >
                  Tickets →
                </a>
                <a
                  href="/dashboard/resolver/assets"
                  className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  Assets →
                </a>
              </div>
            </div>

            <div className="p-2 divide-y divide-slate-800/60">
              {activityItems.length === 0 ? (
                <p className="text-center text-slate-600 font-mono text-xs py-8">
                  No items assigned to you yet
                </p>
              ) : (
                activityItems.map((item) => (
                  <ActivityItem key={item.refId} {...item} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Workload */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/60">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                My Workload
              </span>
            </div>
            <div className="p-4 space-y-3">
              {[
                {
                  label: "Accepted Tickets",
                  current: acceptedTickets.length,
                  max: tickets.length,
                  color: "bg-violet-400",
                },
                {
                  label: "Accepted Assets",
                  current: acceptedAssets.length,
                  max: assets.length,
                  color: "bg-cyan-400",
                },
                {
                  label: "Completed Tickets",
                  current: completedTickets.length,
                  max: tickets.length,
                  color: "bg-emerald-400",
                },
                {
                  label: "Completed Assets",
                  current: completedAssets.length,
                  max: assets.length,
                  color: "bg-sky-400",
                },
              ].map(({ label, current, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-300">{`${current} / ${max || 1}`}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${max > 0 ? (current / max) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/60">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Queue Overview
              </span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: "Pending Tickets", value: pendingTickets.length, color: "text-amber-400" },
                { label: "Pending Assets", value: pendingAssets.length, color: "text-amber-400" },
                { label: "Total Tickets", value: tickets.length, color: "text-slate-300" },
                { label: "Total Assets", value: assets.length, color: "text-slate-300" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-800/50 rounded-lg p-3">
                  <p className={`text-xl font-bold font-mono tabular-nums ${color}`}>{value}</p>
                  <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoardContent;
