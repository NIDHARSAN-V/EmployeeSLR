"use client";

import { useState } from "react";
import DiscussionModal from "./DiscussionModal";

export type LogItem = {
    refId: string;
    kind: "ticket" | "asset";
    request_type: string;
    status: "pending" | "accepted" | "completed";
    raised_by: string;
    createdAt: string;
};

export default function LogView({
    tickets,
    userId,
}: {
    tickets: LogItem[];
    userId: string;
}) {
    const [activeDiscussion, setActiveDiscussion] = useState<{
        kind: "ticket" | "asset";
        refId: string;
    } | null>(null);

    const openDiscussion = (kind: "ticket" | "asset", refId: string) => {
        setActiveDiscussion({ kind, refId });
    };

    // Separate tickets and assets
    const ticketItems = tickets.filter(item => item.kind === "ticket");
    const assetItems = tickets.filter(item => item.kind === "asset");

    const renderItems = (items: LogItem[], title: string) => {
        if (items.length === 0) return null;

        return (
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{title}</h2>
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.refId}
                            className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-slate-800 font-semibold text-lg capitalize">
                                        {item.kind === "ticket" ? "Ticket" : "Asset Request"}
                                    </h4>

                                    <p className="text-slate-600 text-sm mt-1 capitalize">
                                        {item.request_type.replace(/_/g, " ")}
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

                            {/* Discussion Button */}
                            <button
                                onClick={() => openDiscussion(item.kind, item.refId)}
                                className="mt-3 text-blue-600 underline text-sm hover:text-blue-800"
                            >
                                💬 Discussion
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (tickets.length === 0) {
        return <p className="text-slate-500">No activity yet.</p>;
    }

    return (
        <div className="max-w-5xl mx-auto">
            {renderItems(ticketItems, "Tickets")}
            {renderItems(assetItems, "Assets")}
        </div>
    );
}