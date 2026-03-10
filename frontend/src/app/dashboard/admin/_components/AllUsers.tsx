"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";


interface User {
  _id: string;
  userName: string;
  email: string;
  role: "RESOLVER" | "EMPLOYEE";
}

type RoleFilter = "ALL" | "EMPLOYEE" | "RESOLVER";



// export default function () {

export default function AllUsers() {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [searchText, setSearchText] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Fetch user list from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:8000/auth/all");
        if (!response.ok) {
          throw new Error(`Failed: ${response.status}`);
        }

        const data: User[] = await response.json();
        setAllUsers(data);
      } catch (err: any) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);




  // Apply search + role filters
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchRole =
        roleFilter === "ALL" ? true : user.role === roleFilter;

      const matchSearch = user.userName
        .toLowerCase()
        .includes(searchText.toLowerCase());

      return matchRole && matchSearch;
    });
  }, [allUsers, roleFilter, searchText]);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Admin Dashboard</h1>

      {/* Filter Controls */}
      <div
        style={{
          margin: "1rem 0",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        {/* Filter by role */}
        <div>
          <label style={{ fontWeight: "bold" }}>Filter by Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            style={{ marginLeft: "0.5rem", padding: "0.4rem" }}
          >
            <option value="ALL">All</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="RESOLVER">RESOLVER</option>
          </select>
        </div>

        {/* Search by username */}
        <div>
          <label style={{ fontWeight: "bold" }}>Search Username:</label>
          <input
            type="text"
            placeholder="Enter username"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              marginLeft: "0.5rem",
              padding: "0.4rem",
              border: "1px solid #ccc",
            }}
          />
        </div>
      </div>





      {/* Info */}
      <p>
        Showing <strong>{filteredUsers.length}</strong> of{" "}
        {allUsers.length} users
      </p>





      {/* Loading / Error */}
      {loading && <p>Loading users…</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}





      {/* User List */}
      {!loading && !error && (
        <ul>
          {filteredUsers.length === 0 ? (
            <p>No users matched your filters.</p>
          ) : (
            filteredUsers.map((user) => (
              <li key={user._id}>
                {user._id}-{user.userName} — {user.email} — {user.role} -------
                <button className="border-amber-300"
                  onClick={() => {
                    if (user.role === "EMPLOYEE") {
                      router.push(`/dashboard/admin/dashboard/employee-details/${user._id}`);
                    } else if (user.role === "RESOLVER") {
                      router.push(`/dashboard/admin/dashboard/resolver-details/${user._id}`);
                    }
                  }}
                >
                  Details
                </button>
              </li>
            ))
          )}
        </ul>
      )}


      
    </div>
  );

}


