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
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user.email}
      </h1>
      <p className="mb-6 text-gray-700">
        This is your employee dashboard. You can raise new tickets or track your
        existing ones.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">Raise Ticket</h2>
          <p className="text-gray-600">
            Submit a new service request to the resolver team.
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">My Tickets</h2>
          <p className="text-gray-600">
            View status of tickets you've raised.
          </p>
        </div>
      </div>
    </div>
  );
}
