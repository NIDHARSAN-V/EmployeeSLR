"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import HomeView from "./HomeView";
import TicketForm from "./TicketForm";
import AssetForm from "./AssetForm";
import LogView from "./LogView";
import NotificationView from "./NotificationView";

export type Ticket = {
  _id: string;
  type: "ticket" | "asset";
  request_type: string;
  status: "pending" | "accepted" | "completed";
  raised_by: string;
  createdAt: string;
};

// Helper to get a cookie value by name
function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? match.split("=")[1] : "";
}

export default function EmployeePage() {
  const [active, setActive] = useState("home");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  // Get userId from cookie after component mounts
  useEffect(() => {
    const id = getCookie("userId");
    if (id) {
      setUserId(id);
    } else {
      setError("Not logged in. Please login again.");
    }
  }, []);

  // Fetch tickets raised by this user
  const fetchTickets = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/tickets/raised/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchTickets();
  }, [userId]);

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

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar active={active} setActive={setActive} />

      <div className="flex-1 p-8 bg-white min-h-screen">
        {active === "home" && <HomeView />}

        {active === "ticket" && userId && (
          <TicketForm userId={userId} refreshTickets={fetchTickets} />
        )}

        {active === "asset" && userId && (
          <AssetForm userId={userId} refreshTickets={fetchTickets} />
        )}

        {active === "log" && <LogView tickets={tickets} />}

        {active === "notifications" && <NotificationView tickets={tickets} />}
      </div>
    </div>
  );
}