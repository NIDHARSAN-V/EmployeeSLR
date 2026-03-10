"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function AssetForm({ refreshTickets }: { refreshTickets: () => void }) {
  const [requestType, setRequestType] = useState("hardware_request");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { user } = useAuth();
  const userId = user?.id || "";

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

      const res = await fetch("http://localhost:8000/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          request_type: requestType,
          raised_by: userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Failed to submit asset request");
        return;
      }

      setSuccessMsg("Asset request submitted successfully!");
      refreshTickets?.();
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-lg shadow-lg p-6 max-w-md text-slate-200">
      <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-100">
        Request New Asset
      </h2>

      {successMsg && (
        <div className="mb-4 p-3 text-sm bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 rounded font-mono">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 text-sm bg-red-400/10 border border-red-400/30 text-red-400 rounded font-mono">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        <label className="block text-slate-400 uppercase tracking-wider">
          Asset Type
        </label>

        <select
          className="w-full bg-slate-800 border border-slate-700 text-slate-200 p-2 rounded 
          focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
          value={requestType}
          onChange={(e) => setRequestType(e.target.value)}
        >
          <option value="hardware_request">Laptop</option>
          <option value="monitor_request">Monitor</option>
          <option value="keyboard_request">Keyboard</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 py-2 rounded 
          hover:bg-cyan-500/30 transition font-bold tracking-wider uppercase disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}