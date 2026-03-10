"use client";

import BreachTable from "./breachTable";
import RequestCount from "./request-count";

export default function DashboardCard() {
  return (
    <div>
      <h1 className="text-4xl mb-6">DashBoard</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg border-0 p-4">
          <RequestCount name="Critical Requests" ticketCount={3} assetCount={1} />
        </div>

        <div className="rounded-lg border-0 p-4">
          <RequestCount name="Pending Requests" ticketCount={5} assetCount={2} />
          
        </div>

        <div className="rounded-lg border-0 p-4">
          <RequestCount name="Open Requests" ticketCount={7} assetCount={3} />
        </div>

        <div className="rounded-lg border-0 p-4">
          <RequestCount name="Completed Requests" ticketCount={10} assetCount={5} />
        </div>
      </div>
        <div className="rounded-lg border border-gray-300 p-4">
          <BreachTable
          items={[
            {
              id: "1",
              issue: "Data Breach in HR System",
              type: "Data Breach",
              raisedBy: "John Doe",
              acceptedBy: "Jane Smith",
              acceptDueAt: "2023-10-15",
              completeDueAt: "2023-10-20",
            },
          ]} />
          <div className="h-40 bg-gray-100 rounded" />
        </div>
    </div>
  );
}




