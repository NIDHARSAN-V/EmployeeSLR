
export type Ticket = {
  _id: string;
  kind: "ticket" | "asset";
  request_type: string;
  status: "pending" | "accepted" | "completed";
  raised_by: string;
  createdAt: string;
};

export default function LogView({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="max-w-5xl mx-auto">
      {tickets[0].kind=="asset" && <h2 className="text-2xl font-bold text-slate-800 mb-8">
        <br/>
        Assets
      </h2>}

      {tickets[0].kind=="ticket" && <h2 className="text-2xl font-bold text-slate-800 mb-8">
        Tickets
      </h2>}

      {tickets.length === 0 && (
        <p className="text-slate-500">No activity yet.</p>
      )}

      <div className="space-y-4">
        {tickets.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-slate-800 font-semibold text-lg capitalize">
                  {item.kind === "ticket" ? "Ticket" : "Asset Request"}
                </h4>

                <p className="text-slate-600 text-sm mt-1 capitalize">
                  {item.request_type.replace("_", " ")}
                </p>
              </div>

              <span
                className={`px-3 py-1 text-xs font-medium rounded-full
                ${
                  item.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : item.status === "accepted"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {item.status}
              </span>
            </div>

            <p className="text-slate-500 text-sm mt-3">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}