"use client";

import RequestRow from "@/types/breach-table";

export default function BreachTable({ items }: { items: RequestRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
          <tr>
            <th className="px-4 py-3">Issue</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Raised By</th>
            <th className="px-4 py-3">Accepted By</th>
            <th className="px-4 py-3">Accept Due</th>
            <th className="px-4 py-3">Complete Due</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                No requests to display.
              </td>
            </tr>
          ) : (
            items.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{row.issue}</td>
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3">{row.raisedBy}</td>
                <td className="px-4 py-3">{row.acceptedBy ?? "-"}</td>
                <td className="px-4 py-3">{row.acceptDueAt ?? "-"}</td>
                <td className="px-4 py-3">{row.completeDueAt ?? "-"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
                    aria-label="View details"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
