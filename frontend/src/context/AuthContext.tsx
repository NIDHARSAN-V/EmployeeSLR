"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔥 Check auth from backend
  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // login
  const login = async (data: any) => {
    await api.post("/auth/login", data);
    await checkAuth();
    router.push("/dashboard");
  };

  // register
  const register = async (data: any) => {
    await api.post("/auth/register", data);
    router.push("/login");
  };

  // logout
  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, checkAuth, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthContext error");
  return context;
};
