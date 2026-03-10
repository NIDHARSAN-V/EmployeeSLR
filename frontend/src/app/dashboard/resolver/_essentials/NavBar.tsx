"use client";

import { useAuth } from "@/context/AuthContext";

export const NavBar = () => {
  const { logout } = useAuth();
  return (
    <div className="navBar">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-2xl text-text-sec font-bold uppercase tracking-widest">
          Resolver Console
        </span>
      </div>

      <button className="flex justify-center" onClick={logout}>
        Log Out
      </button>
    </div>
  );
};

export default NavBar;
