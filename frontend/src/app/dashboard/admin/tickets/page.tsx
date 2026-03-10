"use client";

import { useEffect, useState } from "react";
import TicketCard from "../_components/TicketCard";
import TicketFilters from "../_components/TicketFilters";
import { GetAllTickets, AcceptTicket, CompleteTicket } from "@/api/ticket";
import { Ticket } from "@/types/ticket";
import { useAuth } from "@/context/AuthContext";

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const allTickets = await GetAllTickets();
        setTickets(allTickets.filter((t) => t.status !== "completed"));
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user?.id]);

  const handleAccept = async (id: string) => {
    if (!user?.id) return;
    try {
      const updated = await AcceptTicket(id, user.id);
      setTickets((prev) => prev.map((t) => (t.refId === id ? { ...t, ...updated } : t)));
    } catch (e) { console.error(e); }
  };

  const handleComplete = async (id: string) => {
    if (!user?.id) return;
    try {
      await CompleteTicket(id, user.id);
      setTickets((prev) => prev.filter((t) => t.refId !== id));
    } catch (e) { console.error(e); }
  };

  const filtered = tickets.filter((t) => {
    const matchesSearch = !search ||
      t.request_type.toLowerCase().includes(search.toLowerCase()) ||
      t.refId.toLowerCase().includes(search.toLowerCase()) ||
      t.kind.toLowerCase().includes(search.toLowerCase()) ||
      t.raised_by.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    pending:  tickets.filter((t) => t.status === "pending").length,
    accepted: tickets.filter((t) => t.status === "accepted").length,
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <p className="text-slate-700 text-xs uppercase tracking-widest animate-pulse">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen text-slate-100 p-6 lg:p-10">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-3">
          ADMIN Console / Tickets
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Ticket Queue</h1>
            <p className="text-sm text-slate-600 mt-1">
              <span className="text-amber-400/80">{counts.pending}</span> pending &nbsp;
              <span className="text-slate-700">·</span> &nbsp;
              <span className="text-sky-400/80">{counts.accepted}</span> in progress
            </p>
          </div> 
        </div>
      </div>

      <TicketFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusTabs={["all", "pending", "accepted"]}
        totalCount={tickets.length}
        filteredCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-slate-600 text-sm">No tickets match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((ticket) => (
            <TicketCard
              key={ticket.refId}
              ticket={ticket}
              onAccept={handleAccept}
              onComplete={handleComplete}
              expanded={expandedTicket === ticket.refId}
              onToggle={() =>
                setExpandedTicket(
                  expandedTicket === ticket.refId ? null : ticket.refId,
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}