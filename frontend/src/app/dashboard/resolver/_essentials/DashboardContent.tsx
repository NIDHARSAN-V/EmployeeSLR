"use client";
import { GetAllTickets, GetTicketsByStatus } from "@/api/ticket";
import { GetAllAssets, GetAssetsByStatus } from "@/api/asset";
import ActivityItem from "../_components/ActivityItem";
import StatsCard from "../_components/StatsCard";
import { UserModel } from "@/types/user";
import { GetAllUsers } from "@/api/user";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export const DashBoardContent = () => {
    const [users, setUsers] = useState<UserModel[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [assets, setAssets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const now = new Date();
    const hour = now.getHours();
    const greeting =
        hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersData, ticketsData, assetsData] = await Promise.all([
                    GetAllUsers(),
                    GetAllTickets(),
                    GetAllAssets(),
                ]);
                setUsers(usersData);
                setTickets(ticketsData);
                setAssets(assetsData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    const pendingTickets = tickets.filter((t) => t.status === "pending");

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 font-sans">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-mono text-slate-100 tracking-tight">
                    {greeting}, rd.
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-mono">
                    {now.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                    {" · "}
                    <span className="text-amber-400">2 critical items</span> need your
                    attention
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {/* {stats.map((s) => (
                    <StatsCard key={s.label} {...s} />
                ))} */}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className="xl:col-span-2">
                    <div className="bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                                    Recent Activity
                                </span>
                                <span className="text-[10px] font-mono bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded px-1.5 py-0.5">
                                    {pendingTickets.length}
                                </span>
                            </div>
                            <a
                                href="/dashboard/tickets"
                                className="text-xs font-mono text-slate-500 hover:text-amber-400 transition-colors"
                            >
                                View all →
                            </a>
                        </div>

                        <div className="p-2 divide-y divide-slate-800/60">
                            {pendingTickets.map((item) => (
                                <ActivityItem key={item.refId} {...item} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-6">
                    <div className="bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-700/60">
                            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                                My Workload
                            </span>
                        </div>
                        <div className="p-4 space-y-3">
                            {[
                                { label: "Open Tickets", current: tickets.length, max: 10, color: "bg-violet-400" },
                                { label: "Asset Requests", current: assets.length, max: 5, color: "bg-cyan-400" },
                                { label: "SLA Compliance", current: 87, max: 100, color: "bg-emerald-400", percent: true },
                            ].map(({ label, current, max, color, percent }) => (
                                <div key={label}>
                                    <div className="flex justify-between text-xs font-mono mb-1.5">
                                        <span className="text-slate-500">{label}</span>
                                        <span className="text-slate-300">
                                            {percent ? `${current}%` : `${current} / ${max}`}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${color} transition-all duration-700`}
                                            style={{ width: `${(current / max) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashBoardContent;