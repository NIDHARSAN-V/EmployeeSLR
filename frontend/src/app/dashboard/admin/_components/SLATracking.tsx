"use client";

import { useSLA } from "@/context/SLAContext";

interface Ticket {
  refId: string;
  request_type: string;
  eventId?: string; // Made optional with ?
  status: string;
  raised_by: string;
  acceptedBy?: string;
  completed_by?: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  acceptDueAt: string;
  completeDueAt?: string;
  deadlineType: string;
  isOverdue: boolean;
  [key: string]: any; // Allow any additional properties
}

export default function SLATracking() {
  const { slaData } = useSLA();

  const mapToResolver = async function(ticket: Ticket) {
    console.log("Mapping ticket to resolver:", ticket);

    try {
      const response = await fetch("http://localhost:8000/admin/assign/resolver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticket: ticket }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Response from server:", result);
    } catch (error) {
      console.error("Error mapping ticket to resolver:", error);
    }
  };

  const remindResolver = async function(ticket: Ticket) {
    console.log("Reminding resolver for ticket:", ticket.refId);
    
    try {
      const response = await fetch("http://localhost:8000/admin/remind/resolver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticket: ticket }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Reminder response from server:", result);
    } catch (error) {
      console.error("Error reminding resolver:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>SLA Tracking (Breached)</h2>
      
      {slaData.length === 0 ? (
        <p>No SLA breaches found.</p>
      ) : (
        (slaData as Ticket[]).map((ticket: Ticket) => (
          <div
            key={ticket.refId}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "15px",
              backgroundColor: ticket.isOverdue ? "#fff5f5" : "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              <p><b>Ref ID:</b> {ticket.refId}</p>
              <p><b>Request Type:</b> {ticket.request_type}</p>
              
              {/* Conditionally render Event ID if it exists */}
              {ticket.eventId && (
                <p><b>Event ID:</b> {ticket.eventId}</p>
              )}
              
              <p><b>Status:</b> {ticket.status}</p>
              <p><b>Raised By:</b> {ticket.raised_by}</p>
              <p><b>Accepted By:</b> {ticket.acceptedBy || "Not Accepted"}</p>
              <p><b>Completed By:</b> {ticket.completed_by || "Not Completed"}</p>

              <p><b>Created At:</b> {new Date(ticket.createdAt).toLocaleString()}</p>
              <p><b>Accepted At:</b> {ticket.acceptedAt ? new Date(ticket.acceptedAt).toLocaleString() : "Not Accepted Yet"}</p>
              <p><b>Completed At:</b> {ticket.completedAt ? new Date(ticket.completedAt).toLocaleString() : "Not Completed Yet"}</p>

              <p><b>Accept Due At:</b> {new Date(ticket.acceptDueAt).toLocaleString()}</p>
              <p><b>Complete Due At:</b> {ticket.completeDueAt ? new Date(ticket.completeDueAt).toLocaleString() : "N/A"}</p>

              <p><b>Deadline Type:</b> {ticket.deadlineType}</p>
              <p><b>Is Overdue:</b> {ticket.isOverdue ? "Yes" : "No"}</p>
            </div>

            {ticket.isOverdue && (
              <p style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>
                ⚠️ SLA Breached!
              </p>
            )}

            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              {ticket.status === "pending" && (
                <button 
                  onClick={() => mapToResolver(ticket)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#0070f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Assign to Resolver
                </button>
              )}

              {ticket.status === "accepted" && (
                <button 
                  onClick={() => remindResolver(ticket)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f5a623",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Remind Resolver
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}