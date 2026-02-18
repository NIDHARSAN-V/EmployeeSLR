"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        if (user.role === "ADMIN") router.push("/dashboard/admin");
        else if (user.role === "RESOLVER") router.push("/dashboard/resolver");
        else router.push("/dashboard/employee");


        // if (user.role === "ADMIN") router.push("/admin");
        // else if (user.role === "RESOLVER") router.push("/resolver");
        // else router.push("/employee");
    }, [user]);

    return <p>Redirecting...</p>;
}
