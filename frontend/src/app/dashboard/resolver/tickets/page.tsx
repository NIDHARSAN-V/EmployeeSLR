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

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const allTickets = await GetAllTickets();
        // Completed tickets live in /history — exclude them here
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
    } catch (e) {
      console.error("Failed to accept ticket", e);
    }
  };

  const handleComplete = async (id: string) => {
    if (!user?.id) return;
    try {
      await CompleteTicket(id, user.id);
      // Remove from active queue — it now lives in history
      setTickets((prev) => prev.filter((t) => t.refId !== id));
    } catch (e) {
      console.error("Failed to complete ticket", e);
    }
  };

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      !search ||
      t.request_type.toLowerCase().includes(search.toLowerCase()) ||
      t.refId.toLowerCase().includes(search.toLowerCase()) ||
      t.kind.toLowerCase().includes(search.toLowerCase()) ||
      t.raised_by.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    pending: tickets.filter((t) => t.status === "pending").length,
    accepted: tickets.filter((t) => t.status === "accepted").length,
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 font-mono text-sm animate-pulse">Loading tickets...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Resolver Console</span>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Tickets</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">Ticket Queue</h1>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              <span className="text-amber-400">{counts.pending}</span> pending ·{" "}
              <span className="text-sky-400">{counts.accepted}</span> accepted
            </p>
          </div>
          <a
            href="/dashboard/resolver/history"
            className="text-xs font-mono px-3 py-1.5 rounded border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors uppercase tracking-wider"
          >
            History →
          </a>
        </div>
      </div>

      {/* Filters — only pending + accepted tabs (no completed) */}
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
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">🎫</div>
          <p className="text-slate-400 font-medium">No tickets match your filters</p>
          <p className="text-xs text-slate-600 font-mono mt-1">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ticket) => (
            <TicketCard
              key={ticket.refId}
              ticket={ticket}
              onAccept={handleAccept}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
