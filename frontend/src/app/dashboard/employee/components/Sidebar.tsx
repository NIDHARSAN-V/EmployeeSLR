export default function Sidebar({ active, setActive }: any) {
  const menu = [
    { label: "Home", value: "home" },
    { label: "Raise Ticket", value: "ticket" },
    { label: "Request Asset", value: "asset" },
    { label: "My Logs", value: "log" },
    { label: "Notifications", value: "notifications" },
  ];

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-slate-800 to-blue-600 text-white p-6">

      <h1 className="text-xl font-semibold mb-8 tracking-wide">Helpdesk</h1>

      {menu.map((item) => (
        <button
          key={item.value}
          onClick={() => setActive(item.value)}
          className={`block w-full text-left px-4 py-2 mb-3 rounded-lg transition-all duration-200 ${
            active === item.value
                ? "bg-white/20 backdrop-blur-sm"
                : "hover:bg-white/10"
            }`}

        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
