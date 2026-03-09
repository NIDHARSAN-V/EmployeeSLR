"use client";

import { useState } from "react";
import TicketCard, { Ticket } from "../_components/TicketCard";
import TicketFilters from "../_components/TicketFilters";


const MOCK_TICKETS: Ticket[] = [
  {
    id: "TKT-0192",
    title: "Outlook not syncing on MacBook Pro",
    description: "User reports that Outlook calendar and emails have stopped syncing since the latest macOS update. Other Office apps appear to be working normally.",
    status: "in_progress",
    priority: "high",
    category: "Software",
    requester: "emily.k@corp.io",
    assignee: "you",
    createdAt: "28 Feb 2026, 09:12",
    updatedAt: "2m ago",
    slaDeadline: "in 4h",
  },
  {
    id: "TKT-0191",
    title: "VPN connection drops intermittently on Windows 11",
    description: "Multiple users on the 4th floor are experiencing VPN disconnections every 20–30 minutes. This is affecting remote access to internal systems.",
    status: "open",
    priority: "critical",
    category: "Network",
    requester: "raj.m@corp.io",
    assignee: "you",
    createdAt: "28 Feb 2026, 08:40",
    updatedAt: "34m ago",
    slaDeadline: "in 1h 30m",
  },
  {
    id: "TKT-0190",
    title: "Password reset for new hire — Emily K.",
    description: "New employee Emily Kwan needs her initial AD password set. She cannot log in to her workstation.",
    status: "resolved",
    priority: "low",
    category: "Access",
    requester: "hr@corp.io",
    assignee: "you",
    createdAt: "28 Feb 2026, 07:55",
    updatedAt: "1h ago",
  },
  {
    id: "TKT-0189",
    title: "3rd floor east wing printer offline",
    description: "The HP LaserJet Pro M404n on the 3rd floor east wing is showing offline status. The device appears powered on. Restarting the print spooler service did not help.",
    status: "open",
    priority: "medium",
    category: "Hardware",
    requester: "ops@corp.io",
    assignee: "you",
    createdAt: "27 Feb 2026, 15:30",
    updatedAt: "3h ago",
    slaDeadline: "Tomorrow 09:00",
  },
  {
    id: "TKT-0188",
    title: "Adobe Creative Cloud licensing error on design workstation",
    description: "The design team workstation shows a license expired error for Adobe CC apps. License was renewed last month. Need to re-validate or reassign the seat.",
    status: "open",
    priority: "high",
    category: "Software",
    requester: "design@corp.io",
    assignee: "you",
    createdAt: "27 Feb 2026, 14:00",
    updatedAt: "5h ago",
    slaDeadline: "Today 17:00",
  },
  {
    id: "TKT-0187",
    title: "Dual-screen setup not working after desk move",
    description: "Finance department employee moved desks. One monitor now shows no signal. Cable and port have been checked — may be a GPU driver issue.",
    status: "in_progress",
    priority: "medium",
    category: "Hardware",
    requester: "finance@corp.io",
    assignee: "you",
    createdAt: "27 Feb 2026, 11:00",
    updatedAt: "6h ago",
  },
  {
    id: "TKT-0186",
    title: "Zoom audio echo during all-hands meeting",
    description: "Audio feedback loop was reported during the all-hands call. Speaker output settings were likely the cause. Investigating conference room AV config.",
    status: "closed",
    priority: "low",
    category: "AV / Conferencing",
    requester: "comms@corp.io",
    assignee: "you",
    createdAt: "26 Feb 2026, 10:00",
    updatedAt: "Yesterday",
  },
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const handleStatusChange = (id: string, newStatus: Ticket["status"]) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.requester.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || t.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const counts = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    critical: tickets.filter((t) => t.priority === "critical").length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Resolver Console
          </span>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
            Tickets
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">
              Ticket Queue
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              <span className="text-amber-400">{counts.open}</span> open ·{" "}
              <span className="text-sky-400">{counts.in_progress}</span> in progress ·{" "}
              {counts.critical > 0 && (
                <span className="text-red-400">{counts.critical} critical</span>
              )}
            </p>
          </div>
          <button className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </button>
        </div>
      </div>

      {/* Filters */}
      <TicketFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        totalCount={tickets.length}
        filteredCount={filtered.length}
      />

      {/* Tickets Grid */}
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
              key={ticket.id}
              ticket={ticket}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
