"use client";

import { apiUrl } from "@/lib/api";
import { useState } from "react";
// If you have a helper, import it. Otherwise define a simple one:


export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const seedData = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // If your route is GET /seed (recommended):
      const res = await fetch(apiUrl("/seed"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      // If you made /seed a POST route instead, use:
      // const res = await fetch(apiUrl("/seed"), {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   credentials: "include",
      // });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Seeding failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-8 font-sans dark:bg-black">
      <h1 className="mb-2 text-5xl font-extrabold text-blue-600">HOME</h1>

      <button
        onClick={seedData}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Seeding..." : "Seed"}
      </button>

      {error && (
        <pre className="max-w-3xl overflow-auto rounded border border-red-300 bg-red-50 p-4 text-red-700">
          Error: {error}
        </pre>
      )}

      {result && (
        <pre className="max-w-3xl overflow-auto rounded border border-green-300 bg-green-50 p-4 text-green-800">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}