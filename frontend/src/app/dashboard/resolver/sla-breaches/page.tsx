"use client";

import { GetBreachedResource, SLAResource } from "@/api/sla";
import { useAuth } from "@/context/AuthContext";
import { useSLA } from "@/context/SLAContext";
import { useEffect, useState } from "react";

export default function SLATracking() {
  const [breachedResource, setBreachedResource] = useState<SLAResource[]>([]);
  const { slaData } = useSLA();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [breachedData] = await Promise.all([
          GetBreachedResource(user?.id),
        ]);
        setBreachedResource(breachedData);
        console.log("Fetched SLA breached resources:", breachedData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const mapToResolver = async function (ticket: SLAResource) {
    console.log("Mapping ticket to resolver:", ticket);
    try {
      const response = await fetch("http://localhost:8000/admin/assign/resolver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: ticket }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      console.log("Response from server:", result);
    } catch (error) {
      console.error("Error mapping ticket to resolver:", error);
    }
  };

  const remindResolver = async function (ticket: SLAResource) {
    console.log("Reminding resolver for ticket:", ticket.refId);
    try {
      const response = await fetch("http://localhost:8000/admin/remind/resolver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: ticket }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      console.log("Reminder response from server:", result);
    } catch (error) {
      console.error("Error reminding resolver:", error);
    }
  };

  if (!breachedResource) {
    return <p className="text-gray-400 p-6">No SLA data...</p>;
  }

  return (
    <div className="min-h-screen p-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-5 border-b border-[#1e1e1e]">
        <h2 className="text-2xl font-semibold text-[#e8e0d0] tracking-wide">
          SLA Tracking
        </h2>
        <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-red-900/20 text-red-400 border border-red-800/30">
          Breached
        </span>
      </div>

      {breachedResource.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#3a3a3a]">
          <span className="text-4xl mb-4">✓</span>
          <p className="text-sm tracking-wider uppercase">No SLA breaches found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {(breachedResource as SLAResource[]).map((resource) => (
            <div
              key={resource.refId}
              className={`bg-[#141414] rounded-2xl border transition-colors duration-200 ${
                resource.isOverdue
                  ? "border-red-800/40 shadow-[0_4px_24px_rgba(0,0,0,0.5),0_0_0_1px_rgba(180,60,60,0.08)]"
                  : "border-[#222] shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:border-[#2e2e2e]"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
                <div className="flex items-center gap-4">
                  <span className="text-[#c8a96e] font-semibold tracking-wider text-sm">
                    {resource.refId}
                  </span>
                  <span className="text-[#555] text-xs">{resource.request_type}</span>
                  {resource.eventId && (
                    <span className="text-[#444] text-xs border border-[#2a2a2a] rounded-full px-2 py-0.5">
                      Event: {resource.eventId}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {resource.isOverdue && (
                    <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-red-900/20 text-red-400 border border-red-800/30">
                      ⚠ Breached
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5 px-6 py-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#444] mb-1">Raised By</p>
                  <p className="text-sm text-[#b0a898]">{resource.raised_by}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#444] mb-1">Accepted By</p>
                  <p className="text-sm text-[#b0a898]">{resource.acceptedBy || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#444] mb-1">Completed By</p>
                  <p className="text-sm text-[#b0a898]">{resource.completed_by || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#444] mb-1">Created At</p>
                  <p className="text-sm text-[#b0a898]">{new Date(resource.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#444] mb-1">Accepted At</p>
                  <p className="text-sm text-[#b0a898]">
                    {resource.acceptedAt ? new Date(resource.acceptedAt).toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#444] mb-1">Completed At</p>
                  <p className="text-sm text-[#b0a898]">
                    {resource.completedAt ? new Date(resource.completedAt).toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#444] mb-1">Accept Due</p>
                  <p className="text-sm text-[#b0a898]">{new Date(resource.acceptDueAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#444] mb-1">Complete Due</p>
                  <p className="text-sm text-[#b0a898]">
                    {resource.completeDueAt ? new Date(resource.completeDueAt).toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#444] mb-1">Deadline Type</p>
                  <p className="text-sm text-[#b0a898]">{resource.deadlineType}</p>
                </div>
              </div>           
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
