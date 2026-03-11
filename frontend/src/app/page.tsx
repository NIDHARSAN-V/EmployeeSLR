import Image from "next/image";

export default function Home() {


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-5xl font-extrabold text-blue-600 mb-4">HOME</h1>
    </div>
    
  );
}







// "use client";

// import { apiUrl } from "@/lib/api";
// import { useState } from "react";

// export default function Home() {
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);

//   const seedData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       setResult(null);

//       const res = await fetch(apiUrl("/seed"), {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include", // optional
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || "Seeding failed");
//       setResult(data);
//     } catch (err: any) {
//       setError(err?.message ?? "Unknown error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="…">
//       …
//       <button onClick={seedData} disabled={loading}>
//         {loading ? "Seeding…" : "Seed"}
//       </button>

//       <h1>Home Page</h1>

//       {error && <pre className="…">Error: {error}</pre>}
//       {result && <pre className="…">{JSON.stringify(result, null, 2)}</pre>}
//     </div>
//   );
// }