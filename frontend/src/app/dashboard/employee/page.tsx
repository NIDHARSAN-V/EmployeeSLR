"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function EmployeeDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // if not logged in or wrong role redirect
      if (!user || user.role !== "EMPLOYEE") {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "EMPLOYEE") {
    return <div>Loading...</div>;
  }

  return <h1>Employee Dashboard</h1>;
} 
