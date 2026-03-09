import { GetUserById } from "@/api/user";
import { Asset } from "@/types/asset";
import { Ticket } from "@/types/ticket";
import { useEffect, useState } from "react";

type ActivityItemProps = Ticket | Asset;

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  accepted: { label: "Accepted", class: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
  completed: { label: "Completed", class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
};

export default function ActivityItem(props: ActivityItemProps) {
  const { kind, request_type, raised_by, createdAt, status } = props;
  const [raisedBy, setRaisedBy] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await GetUserById(raised_by);
        setRaisedBy(user.userName);
      } catch (error) {
        console.error(error);
        setRaisedBy(raised_by);
      }
    };
    fetchUser();
  }, [raised_by]);

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sc = statusConfig[status] ?? statusConfig["pending"];

  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800/60 transition-colors group border border-transparent hover:border-slate-700/50">
      <div className="shrink-0 w-16 text-center text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border text-violet-400 bg-violet-400/10 border-violet-400/30">
        {kind}
      </div>

      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate group-hover:text-white transition-colors">
          {request_type}
        </p>
      </div>

  
      <div className={`shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border ${sc.class}`}>
        {sc.label}
      </div>

      
      <div className="hidden sm:flex shrink-0 items-center gap-1.5 text-xs text-slate-500 font-mono">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>{raisedBy || "..."}</span>
      </div>


      <p className="shrink-0 text-xs font-mono text-slate-600 pl-2 text-right">
        {formattedDate}
      </p>
    </div>
  );
}
