"use client";

import { useSLA } from "@/context/SLAContext";


export default function SLATracking() {

   const {slaData}  = useSLA();
   const mapToResolver = async function(ticket)
   {
          console.log( "Mapping ticket to resolver:" , ticket)

          const response = await fetch("http://localhost:8000/admin/assign/resolver" , {
            method : "POST",
            headers : {
              "Content-Type": "application/json"
            },
            body : JSON.stringify({"ticket" : ticket})
          });

          const result = await response.json();
          console.log("Response from server:", result);

   }




   const remindResolver = async function(ticket)
   {
          console.log("Reminding resolver for ticket:", ticket.refId);
   }
   
  return (
    <div>

      <h2>SLA Tracking(Breached)</h2>
        {slaData.map((ticket) => (

        <div
          key={ticket.refId}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px"
          }}
        >

          <p><b>Ref ID:</b> {ticket.refId}</p>
          <p><b>Request Type:</b> {ticket.request_type}</p>
          <p><b>Event ID:</b> {ticket.eventId}</p>
          <p><b>Status:</b> {ticket.status}</p>
          <p><b>Raised By:</b> {ticket.raised_by}</p>
          <p><b>Accepted By:</b> {ticket.accepted_by || "Not Accepted"}</p>
          <p><b>Completed By:</b> {ticket.completed_by || "Not Completed"}</p>

          <p><b>Created At:</b> {ticket.createdAt}</p>
          <p><b>Accepted At:</b> {ticket.acceptedAt || "Not Accepted Yet"}</p>
          <p><b>Completed At:</b> {ticket.completedAt || "Not Completed Yet"}</p>

          <p><b>Accept Due At:</b> {ticket.acceptDueAt}</p>
          <p><b>Complete Due At:</b> {ticket.completeDueAt || "N/A"}</p>

          <p><b>Deadline Type:</b> {ticket.deadlineType}</p>
          <p><b>Is Overdue:</b> {ticket.isOverdue ? "Yes" : "No"}</p>


          {ticket.isOverdue && <p style={{ color: "red" }}><b>!!! SLA Breached !!!</b></p>}

          {ticket.status==="pending" && <button onClick={() => mapToResolver(ticket)}>Assign to Resolver</button>}

          {ticket.status==="accepted" && <button onClick={() => mapToResolver(ticket)}>Remind Resolver</button>}

        </div>

      ))}


      {/* <h2>SLA Tracking</h2> */}

    </div>
  )
 
}
