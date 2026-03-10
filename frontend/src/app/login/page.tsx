"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [router, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1221] px-4">
      <div className="w-full max-w-md bg-[#0F162A] border border-white/10 rounded-xl p-8">
        
        <h2 className="text-2xl font-semibold text-gray-100 mb-6 text-center">
          Sign in to your account
        </h2>

        <div className="space-y-5">

          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-11 px-3 rounded-md bg-[#0B1221] border border-white/10 text-gray-200 
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-400">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full h-11 px-3 rounded-md bg-[#0B1221] border border-white/10 text-gray-200 
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            onClick={() => login(form)}
            className="w-full h-11 rounded-md bg-blue-600 text-white font-medium 
                       hover:bg-blue-500 transition-colors"
          >
            Sign In
          </button>

          
          <p className="text-center text-sm text-gray-400 mt-4">
            New user?{" "}
            <span
              onClick={() => router.push("/register")}
              className="text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Create an account
            </span>
          </p>

        </div>

      </div>
    </div>
  );
}