"use client";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#eee" }}>
      <h3>My App</h3>

      {user && (
        <div>
          <span>{user.email} ({user.role})</span>
          <button onClick={logout} style={{ marginLeft: "10px" }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
