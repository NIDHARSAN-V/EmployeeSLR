"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/dist/client/components/navigation";
import router from "next/dist/shared/lib/router/router";

export default function RegisterPage() {
  const { register } = useAuth();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });

  useEffect(() => {
      if (user){
    router.push("/dashboard");
      }
  }, [user]);

  return (
    <div>
      <h2>Register</h2>

      <input placeholder="Name" onChange={(e) => setForm({ ...form, userName: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />

      <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
        <option value="EMPLOYEE">EMPLOYEE</option>
        <option value="RESOLVER">RESOLVER</option>
        <option value="ADMIN">ADMIN</option>
      </select>

      <button onClick={() => register(form)}>Register</button>
    </div>
  );
}
