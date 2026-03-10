"use client";

import { useState, useEffect } from "react";
import Sidebar from "../_components/Sidebar";
import HomeView from "../_components/HomeView";
import TicketForm from "../TicketForm/page";
import AssetForm from "../AssetForm/page";
import LogView from "../_components/LogView";



export type LogItem = {
  refId: string;
  kind: "ticket" | "asset";
  request_type: string;
  status: "pending" | "accepted" | "completed";
  raised_by: string;
  createdAt: string;
};


function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? match.split("=")[1] : "";
}

export default function EmployeePage() {
  const [active, setActive] = useState<string>("home");
  const [tickets, setTickets] = useState<LogItem[]>([]);
  const [assets, setAssets] = useState<LogItem[]>([]);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  
  useEffect(() => {
    const id = getCookie("userId");
    if (id) {
      setUserId(id);
    } else {
      setError("Not logged in. Please login again.");
    }
  }, []);

  
  
    const fetchAssets = async () => {
    if (!userId) return;
    try {
      const res = await fetch(apiUrl(`/assets/raised/${userId}`), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  const fetchTickets = async () => {
    if (!userId) return;
    try {
      const res = await fetch(apiUrl(`/tickets/raised/${userId}`), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };






  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-red-600 font-semibold text-lg">{error}</p>
          <a href="/login" className="mt-4 inline-block text-blue-600 underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (userId) {
      fetchTickets();
      fetchAssets();
    }
  }, [userId]);

  return (
  <div className="flex min-h-screen bg-slate-950 text-slate-100">
    
    
    <div className="flex-1 p-8">
      <HomeView />

      <div className="mt-8">
        <LogView tickets={tickets} userId={userId} />
      </div>

      <div className="mt-8">
        <LogView tickets={assets} userId={userId} />
      </div>
    </div>
  </div>
);
}

