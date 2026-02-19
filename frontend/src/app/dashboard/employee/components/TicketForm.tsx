"use client";

import { useState } from "react";

export default function TicketForm({
  userId,
  refreshTickets,
}: {
  userId: string;
  refreshTickets: () => void;
}) {
  const [requestType, setRequestType] = useState("vpn_issue");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!userId) {
      alert("User not authenticated");
      return;
    }

    try {
      setLoading(true);

      await fetch("http://localhost:5000/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "ticket",
          request_type: requestType,
          raised_by: userId,
        }),
      });

      refreshTickets(); // refresh logs after creation
      alert("Ticket created successfully!");
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 max-w-md">

      <h2 className="text-3xl font-bold text-slate-800 mb-6">
        Raise Ticket
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <label className="block text-slate-700 font-medium">
          Select Request Type
        </label>

        <select
          className="w-full border border-slate-300 p-2 rounded text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={requestType}
          onChange={(e) => setRequestType(e.target.value)}
        >
          <option value="vpn_issue">VPN Issue</option>
          <option value="password_reset">Password Reset</option>
          <option value="software_issue">Software Issue</option>
        </select>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

      </form>
    </div>
  );
}
