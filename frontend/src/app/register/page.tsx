"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [router, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1221] px-4">

      <div className="w-full max-w-md bg-[#0F162A] border border-white/10 rounded-xl p-8">

        <h2 className="text-2xl font-semibold text-gray-100 mb-6 text-center">
          Create an Account
        </h2>

        <div className="space-y-5">
          
          {/* Name */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-400">Name</label>
            <input
              type="text"
              placeholder="Your name"
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              className="h-11 px-3 rounded-md bg-[#0B1221] border border-white/10 text-gray-200 
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-11 px-3 rounded-md bg-[#0B1221] border border-white/10 text-gray-200 
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-400">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="h-11 px-3 rounded-md bg-[#0B1221] border border-white/10 text-gray-200 
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-400">Role</label>
            <select
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="h-11 px-3 rounded-md bg-[#0B1221] border border-white/10 text-gray-200 
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="RESOLVER">RESOLVER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {/* Register Button */}
          <button
            onClick={() => register(form)}
            className="w-full h-11 rounded-md bg-blue-600 text-white font-medium 
                       hover:bg-blue-500 transition-colors"
          >
            Register
          </button>

          {/* Already have an account? */}
          <p className="text-center text-sm text-gray-400">
            Already registered?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Login here
            </span>
          </p>

        </div>

      </div>
    </div>
  );
}