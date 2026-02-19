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

export default function EmployeePage() {
  const [active, setActive] = useState("home");
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Get userId from cookies
  const userId =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("userId="))
          ?.split("=")[1]
      : "";

  // Fetch tickets raised by this user
  const fetchTickets = async () => {
    if (!userId) return;

    try {
      const res = await fetch(
        `http://localhost:5000/tickets/raised/${userId}`
      );
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [userId]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar active={active} setActive={setActive} />

      <div className="flex-1 p-8 bg-white min-h-screen">
        {active === "home" && <HomeView />}

        {active === "ticket" && (
          <TicketForm userId={userId} refreshTickets={fetchTickets} />
        )}

        {active === "asset" && (
          <AssetForm userId={userId} refreshTickets={fetchTickets} />
        )}

        {active === "log" && <LogView tickets={tickets} />}

        {active === "notifications" && (
          <NotificationView tickets={tickets} />
        )}
      </div>
    </div>
  );
}
