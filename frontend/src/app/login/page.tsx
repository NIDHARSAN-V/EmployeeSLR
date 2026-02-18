"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/dist/client/components/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
 const router = useRouter();
  const {user } = useAuth();

  
     useEffect(() => {
         if (user){
       router.push("/dashboard");
         }
     }, [user]);


  return (
    <div>
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={() => login(form)}>Login</button>
    </div>
  );
}
