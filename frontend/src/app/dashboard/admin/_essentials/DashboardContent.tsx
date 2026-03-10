"use client";

import { GetAllTickets } from "@/api/ticket";
import { GetAllAssets } from "@/api/asset";
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

      </div>
    </div>
  );
};

export default DashBoardContent;
