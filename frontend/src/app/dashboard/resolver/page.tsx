"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ResolverDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "RESOLVER") {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "RESOLVER") {
    return <div>Loading...</div>;
  }

  return <h1>Resolver Dashboard</h1>;
} 
