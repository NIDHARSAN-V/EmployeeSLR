"use client";

import { GetBreachedResource, SLAResource } from "@/api/sla";
import { GetUserById } from "@/api/user";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function SLATracking() {
  const [breachedResource, setBreachedResource] = useState<SLAResource[]>([]);
  const [raisedByName, setRaisedByName] = useState<string>("--");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [breachedData, name] = await Promise.all([
          GetBreachedResource(user?.id),
          GetUserById(user.id),
        ]);
        setBreachedResource(breachedData);
        setRaisedByName(name.userName);
        console.log("Fetched SLA breached resources:", breachedData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [user]);

  if (!breachedResource) {
    return <p className=" p-6">No SLA data...</p>;
  }

  return (
    <div className="min-h-screen text-slate-100 p-6 lg:p-10">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.2em] mb-3">
          Resolver Console / SLA Breaches
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">
              SLA Tracking
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              <span className="text-lg text-black font-bold border-2 rounded-xl bg-red-600 p-1">
                {breachedResource.length}
              </span>{" "}
              breached
            </p>
          </div>
        </div>
      </div>

      {breachedResource.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-slate-600 text-sm">No SLA breaches found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {(breachedResource as SLAResource[]).map((resource) => (
            <div
              key={resource.refId}
              className={`bg-slate-800/50 rounded-2xl border transition-colors duration-200 ${
                resource.isOverdue
                  ? "border-red-800/40 shadow-[0_4px_24px_rgba(0,0,0,0.5),0_0_0_1px_rgba(180,60,60,0.08)]"
                  : "border-slate-700/50 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:border-slate-600/50"
              }`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                  <span className="text-amber-400/80 font-semibold tracking-wider text-sm">
                    {resource.request_type}
                  </span>
                  {resource.eventId && (
                    <span className="text-slate-700 text-xs border border-slate-600 rounded-full px-2 py-0.5">
                      Event: {resource.eventId}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {resource.isOverdue && (
                    <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-red-900/20 text-red-400 border border-red-800/30">
                      Breached
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5 px-6 py-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">
                    Raised By
                  </p>
                  <p className="text-sm text-slate-100">{raisedByName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">
                    Created At
                  </p>
                  <p className="text-sm text-slate-100">
                    {new Date(resource.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">
                    Accepted At
                  </p>
                  <p className="text-sm text-slate-100">
                    {resource.acceptedAt
                      ? new Date(resource.acceptedAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">
                    Accept Due
                  </p>
                  <p className="text-sm text-slate-100">
                    {new Date(resource.acceptDueAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">
                    Complete Due
                  </p>
                  <p className="text-sm text-slate-100">
                    {resource.completeDueAt
                      ? new Date(resource.completeDueAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">
                    Deadline Type
                  </p>
                  <p className="text-sm text-slate-100">
                    {resource.deadlineType}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
