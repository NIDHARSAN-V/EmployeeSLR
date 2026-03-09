

import { useRouter } from "next/navigation";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: string;
  accent: string;
}

const actions: QuickAction[] = [
  {
    label: "New Ticket",
    description: "Log an incoming support request",
    href: "/dashboard/tickets/new",
    icon: "🎫",
    accent: "hover:border-violet-400/60 hover:shadow-violet-500/10",
  },
  {
    label: "New Asset Request",
    description: "Submit an asset provisioning request",
    href: "/dashboard/assets/new",
    icon: "📦",
    accent: "hover:border-cyan-400/60 hover:shadow-cyan-500/10",
  },
  {
    label: "View All Tickets",
    description: "See your full ticket queue",
    href: "/dashboard/tickets",
    icon: "🗂",
    accent: "hover:border-amber-400/60 hover:shadow-amber-500/10",
  },
  {
    label: "Asset Inventory",
    description: "Browse all managed assets",
    href: "/dashboard/assets",
    icon: "🖥",
    accent: "hover:border-emerald-400/60 hover:shadow-emerald-500/10",
  },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => router.push(action.href)}
          className={`text-left p-4 bg-slate-900 border border-slate-700/60 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group ${action.accent}`}
        >
          <span className="text-2xl block mb-2">{action.icon}</span>
          <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
            {action.label}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {action.description}
          </p>
        </button>
      ))}
    </div>
  );
}
