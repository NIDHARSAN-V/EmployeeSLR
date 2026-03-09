export default function ActivityItem({
  kind,
    request_type,
    status,
    raised_by,
    createdAt,
}: Ticket) {
  const date = new Date(createdAt);

  const formattedDate = date.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800/60 transition-colors group cursor-pointer border border-transparent hover:border-slate-700/50">
      {/* Type badge */}
      <div
        className={`flex-shrink-0 w-16 text-center text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border ${
      
             "text-violet-400 bg-violet-400/10 border-violet-400/30"
            
        }`}
      >
        {kind}
      </div>

      {/* Title & ID */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate group-hover:text-white transition-colors">
          {request_type}
        </p>
        <p className="text-xs font-mono text-slate-600 mt-0.5">#{}</p>
      </div>

      {/* Assignee */}
        <div className="hidden sm:flex flex-shrink-0 items-center gap-1.5 text-xs text-slate-500 font-mono">
          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-bold">
            {raised_by}
          </div>
        </div>
      

      {/* Status */}
      <div
        className={`flex-shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border text-sky-400 bg-sky-400/10 border-sky-400/30`}
      >
        pending
      </div>

      {/* Time */}
      <p className="flex-shrink-0 text-xs font-mono text-slate-600 w-20 text-right">
        {formattedDate}
      </p>
    </div>
  );
}
