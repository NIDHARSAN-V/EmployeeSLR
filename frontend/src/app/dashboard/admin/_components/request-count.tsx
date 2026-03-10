import RequestCountProps from "@/types/request-count";

export default function RequestCount({ name, ticketCount, assetCount }: RequestCountProps) {
    return (
        <div className="bg-[#0d1117] border border-slate-800 hover:border-slate-700 transition-all duration-200 p-6">
            <div className="mb-6">
                <p className="text-[11px] uppercase tracking-widest text-slate-600 mb-2">{name}</p>
            </div>

            <div className="flex items-center justify-center pt-4 border-t border-slate-800/80">
                <div className="flex-1">
                    <div className="text-4xl font-bold text-slate-200 mb-1">{ticketCount}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-600">Tickets</div>
                </div>
                
                <div className="w-px h-12 bg-slate-800/50 mx-6" />
                
                <div className="flex-1 text-right">
                    <div className="text-4xl font-bold text-slate-200 mb-1">{assetCount}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-600">Assets</div>
                </div>
            </div>
        </div>
    );
}