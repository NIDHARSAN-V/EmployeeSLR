"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LogView from "./components/LogView";

// Base type with common properties
type BaseItem = {
    _id: string;
    refId: string;           // required by LogView - added to both
    kind: "ticket" | "asset";
    request_type: string;
    status: "pending" | "accepted" | "completed";
    raised_by: string;
    createdAt: string;
};

export type Ticket = BaseItem & {
    kind: "ticket";
    // Add any ticket-specific fields here
};

export type Asset = BaseItem & {
    kind: "asset";
    // Add any asset-specific fields here
};

// Union type for LogView
export type LogItem = Ticket | Asset;

export default function EmployeeDetails() {
    const params = useParams<{ id: string }>();
    const userId = params.id;

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
        fetchTickets();
        fetchAssets();
    }, [userId]);

    const fetchAssets = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8000/assets/raised/${userId}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            // Ensure each asset has a refId (using _id as fallback)
            const formattedAssets = (Array.isArray(data) ? data : []).map((asset: any) => ({
                ...asset,
                refId: asset.refId || asset._id, // Ensure refId exists
                kind: "asset" as const
            }));
            setAssets(formattedAssets);
        } catch (err) {
            console.error("Error fetching assets:", err);
        }
    };

    const fetchTickets = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8000/tickets/raised/${userId}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            // Ensure each ticket has a refId
            const formattedTickets = (Array.isArray(data) ? data : []).map((ticket: any) => ({
                ...ticket,
                refId: ticket.refId || ticket._id, // Ensure refId exists
                kind: "ticket" as const
            }));
            setTickets(formattedTickets);
        } catch (err) {
            console.error("Error fetching tickets:", err);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Employee Details - {userId}</h1>
            
            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Ticket Log</h2>
                    <LogView tickets={tickets} userId={userId} />
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold mb-4">Asset Log</h2>
                    <LogView tickets={assets} userId={userId} />
                </div>
            </div>
        </div>
    );
}