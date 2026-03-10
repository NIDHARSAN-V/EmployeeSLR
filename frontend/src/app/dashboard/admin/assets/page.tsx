"use client";

import IssueTable from "../_components/IssueTable";

export default function AssetsPage() {
  return (
    <IssueTable
      items={[
        {
          kind: "ticket",
          refId: "69ae897be9a18f5033366c33",
          request_type: "Printer Offline",
          status: "completed",
          raised_by: "69ae897be9a18f5033366a56",
          accepted_by: "69ae8978e9a18f5033366a3e",
          completed_by: "69ae8978e9a18f5033366a3e",
          createdAt: "2026-03-09T08:48:59.581Z",
          acceptedAt: "2026-03-09T08:48:59.589Z",
          completedAt: "2026-03-09T08:48:59.597Z",
          acceptDueAt: "2026-03-09T08:50:59.581Z",
          completeDueAt: "2026-03-09T08:50:59.589Z",
        },
      ]}
      onViewDetails={(id) => {
        console.log(`View details for ticket: ${id}`);
      }}
    />
  );
}
