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
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!userId) {
      setErrorMsg("User not authenticated. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "ticket",
          request_type: requestType,
          raised_by: userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Failed to create ticket");
        return;
      }

      setSuccessMsg("✅ Ticket created successfully!");
      refreshTickets();
    } catch (error) {
      console.error("Error creating ticket:", error);
      setErrorMsg("Failed to connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 max-w-md">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Raise Ticket</h2>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMsg}
        </div>
      )}

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
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}