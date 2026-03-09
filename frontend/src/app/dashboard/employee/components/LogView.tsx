import { Ticket } from "./EmployeePage";

export default function LogView({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="max-w-5xl mx-auto">

      <h2 className="text-2xl font-bold text-slate-800 mb-8">
        My Activity Logs
      </h2>

      {tickets.length === 0 && (
        <p className="text-slate-500">No requests raised yet.</p>
      )}

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket._id}
            className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">

              <div>
                <h4 className="text-slate-800 font-semibold text-lg capitalize">
                  {ticket.type}
                </h4>

                <p className="text-slate-600 text-sm mt-1">
                  {ticket.request_type.replace("_", " ")}
                </p>
              </div>

              <span
                className={`px-3 py-1 text-xs font-medium rounded-full
                  ${
                    ticket.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : ticket.status === "accepted"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
              >
                {ticket.status}
              </span>
            </div>

            <p className="text-slate-500 text-sm mt-3">
              {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
