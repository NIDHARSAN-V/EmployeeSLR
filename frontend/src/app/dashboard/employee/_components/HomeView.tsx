"use client";

import { useEffect, useState } from "react";
import { GetUserById } from "@/api/user";
import { useAuth } from "@/context/AuthContext";
import { UserModel } from "@/types/user";

export default function HomeView() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserModel | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchUser = async () => {
      const res = await GetUserById(user.id);
      setUserData(res);
    };

    fetchUser();
  }, [user?.id]);

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-lg p-6 shadow-lg mb-8">
      {/* Greeting */}
      <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
        Welcome,{" "}
        <span className="text-cyan-400">
          {userData?.userName || "Loading..."}
        </span>
      </h2>

      {/* Subtext */}
      <p className="text-slate-400 font-mono text-xs mt-2">
        Here’s a quick overview of your requests and activity.
      </p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
        <DashboardCard title="Tickets" value="Your ticket logs" color="cyan" />
        <DashboardCard title="Assets" value="Your asset requests" color="amber" />
        <DashboardCard title="Support" value="24/7 available" color="emerald" />
      </div>
    </div>
  );
}

/* Small reusable dashboard metric box */
function DashboardCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: "cyan" | "amber" | "emerald";
}) {
  const colorMap = {
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  };

  return (
    <div
      className={`p-4 rounded-lg border font-mono text-xs ${colorMap[color]} shadow-sm`}
    >
      <p className="uppercase tracking-wider text-[10px]">{title}</p>
      <p className="text-sm mt-1 font-bold">{value}</p>
    </div>
  );
}