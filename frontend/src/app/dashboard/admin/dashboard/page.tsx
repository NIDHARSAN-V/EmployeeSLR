"use client";

import { useEffect, useState } from "react";
import AllUsers from "../components/AllUsers";
// import Settings from "../components/Settings";
// import Reports from "../components/Reports";

type TabKey = "users" | "settings" | "reports";

const NAV_ITEMS: { key: TabKey; label: string }[] = [
  { key: "users", label: "All Users" },
  { key: "settings", label: "Settings" },
  { key: "reports", label: "Reports" },
];

export default function Dashboard() {
  // Default tab is "users"
  const [active, setActive] = useState<TabKey>("users");

  // If you want to derive from localStorage or some logic:
  // useEffect(() => { setActive("users"); }, []);

  const renderContent = () => {
    switch (active) {
      case "users":
        return <AllUsers />;
    //   case "settings":
    //     return <Settings />;
    //   case "reports":
    //     return <Reports />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </div>

        <nav className="p-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`w-full text-left px-3 py-2 rounded-md transition ${
                active === item.key
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
}