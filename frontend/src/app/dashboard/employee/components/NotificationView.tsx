import { Ticket } from "./EmployeePage";

export default function NotificationView({
  tickets,
}: {
  tickets: Ticket[];
}) {
  // Show notifications for accepted and completed tickets
  const notifications = tickets.filter(
    (ticket) =>
      ticket.status === "accepted" ||
      ticket.status === "completed"
  );

  return (
    <div className="max-w-4xl mx-auto">

      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Notifications
      </h2>

      {notifications.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
          <p className="text-slate-600">
            No notifications yet.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {notifications.map((ticket) => (
          <div
            key={ticket._id}
            className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex items-start gap-3 hover:shadow-md transition"
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold
                ${
                  ticket.status === "accepted"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-green-100 text-green-600"
                }`}
            >
              {ticket.status === "accepted" ? "A" : "✓"}
            </div>

            <div>
              <p className="text-slate-800 font-medium capitalize">
                Your {ticket.type} request (
                {ticket.request_type.replace("_", " ")})
                has been {ticket.status}.
              </p>

              <p className="text-slate-500 text-sm mt-1">
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
