"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LogView from "./components/LogView";

export type Ticket = {
    _id: string;
    refId: string;           // required by LogView
    kind: "ticket" | "asset";
    request_type: string;
    status: "pending" | "accepted" | "completed";
    raised_by: string;
    createdAt: string;
};

export type Asset = {
    _id: string;
    kind: "ticket" | "asset";
    request_type: string;
    status: "pending" | "accepted" | "completed";
    raised_by: string;
    createdAt: string;
};




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
            setAssets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching tickets:", err);
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
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching tickets:", err);
        }
    };




    return (
        <div>
            <h1>Employee Details - {userId}</h1>
             <br />
             <h1>Ticket Log</h1>
             <LogView tickets={tickets} userId={userId} />
             
             <LogView tickets={assets} userId={userId} />
        </div>
    )
}