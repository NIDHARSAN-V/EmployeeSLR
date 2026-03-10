import { GetUserById } from "@/api/user";
import { Asset } from "@/types/asset";
import { Ticket } from "@/types/ticket";
import { useEffect, useState } from "react";

type ActivityItemProps = Ticket | Asset;

const statusConfig: Record<string, { label: string; class: string }> = {
  pending:   { label: "Pending",   class: "text-yellow-400/80 bg-yellow-400/[0.07]" },
  accepted:  { label: "Accepted",  class: "text-yellow-400/80 bg-yellow-400/[0.07]" },
  completed: { label: "Completed", class: "text-emerald-400/80 bg-emerald-400/[0.07]" },
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
  const isAsset = kind?.toLowerCase() === "asset";

  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-white/[0.02] transition-colors group">

      <span className={`shrink-0 w-14 text-center text-[10px] font-semibold uppercase tracking-widest py-0.5 rounded-sm ${
        isAsset
          ? "text-purple-400/80 bg-purple-400/[0.07]"
          : "text-cyan-400/80 bg-cyan-400/[0.07]"
      }`}>
        {kind}
      </span>

      <p className="flex-1 min-w-0 text-sm text-slate-300 truncate group-hover:text-white transition-colors">
        {request_type}
      </p>

      <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-sm ${sc.class}`}>
        {sc.label}
      </span>

      <div className="hidden sm:flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>{raisedBy || "..."}</span>
      </div>

      <p className="shrink-0 text-xs text-slate-600 w-28 text-right">
        {formattedDate}
      </p>
    </div>
  );
}