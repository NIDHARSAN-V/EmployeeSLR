"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { apiUrl } from "@/lib/api";

interface User {
  _id: string;
  userName: string;
  email: string;
  role: "RESOLVER" | "EMPLOYEE";
}

type RoleFilter = "ALL" | "EMPLOYEE" | "RESOLVER";

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

        const response = await fetch(apiUrl("/auth/all"));
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
      const matchRole = roleFilter === "ALL" ? true : user.role === roleFilter;

      const matchSearch = user.userName
        .toLowerCase()
        .includes(searchText.toLowerCase());

      return matchRole && matchSearch;
    });
  }, [allUsers, roleFilter, searchText]);

  const employeeCount = allUsers.filter((u) => u.role === "EMPLOYEE").length;
  const resolverCount = allUsers.filter((u) => u.role === "RESOLVER").length;

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 font-mono text-sm animate-pulse">
          Loading users...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Admin Console
          </span>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
            Users
          </span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">
              User Management
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              <span className="text-blue-400">{employeeCount}</span> employees ·{" "}
              <span className="text-purple-400">{resolverCount}</span> resolvers
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-400/10 border border-red-400/30 text-red-400 px-4 py-3 rounded-lg text-sm font-mono">
          ⚠ Error: {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search username..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 font-mono focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20 transition-colors"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/60 rounded-lg p-1">
          {(["ALL", "EMPLOYEE", "RESOLVER"] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded transition-all duration-150 ${
                roleFilter === role
                  ? role === "EMPLOYEE"
                    ? "bg-blue-400 text-slate-950 font-bold"
                    : "bg-purple-400 text-slate-950 font-bold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {role === "ALL" ? "All" : role}
            </button>
          ))}
        </div>

        <p className="text-xs font-mono text-slate-600 whitespace-nowrap ml-auto">
          {filteredUsers.length === allUsers.length
            ? `${allUsers.length} users`
            : `${filteredUsers.length} of ${allUsers.length}`}
        </p>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">👤</div>
          <p className="text-slate-400 font-medium">No users found</p>
          <p className="text-xs text-slate-600 font-mono mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden">
          <div className="divide-y divide-slate-800/60">
            {filteredUsers.map((user) => (
              <UserRow key={user._id} user={user} router={router} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserRow({
  user,
  router,
}: {
  user: User;
  router: ReturnType<typeof useRouter>;
}) {
  const isEmployee = user.role === "EMPLOYEE";

  return (
    <div className="px-4 py-4 hover:bg-slate-800/40 transition-colors">
      <div className="flex items-center gap-4">
        {/* Role badge */}
        <div
          className={`shrink-0 w-20 text-center text-[10px] font-mono uppercase tracking-widest px-2 py-1.5 rounded border ${
            isEmployee
              ? "text-blue-400 bg-blue-400/10 border-blue-400/30"
              : "text-purple-400 bg-purple-400/10 border-purple-400/30"
          }`}
        >
          {user.role}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 font-semibold truncate">
            {user.userName}
          </p>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
            {user.email}
          </p>
        </div>

        {/* User ID */}
        <p className="shrink-0 text-sm font-mono text-slate-600 hidden sm:block">
          {user._id}
        </p>

        {/* Action Button */}
        {/* <button
          onClick={() => {
            if (isEmployee) {
              router.push(
                `/dashboard/admin/dashboard/employee-details/${user._id}`,
              );
            } else {
              router.push(
                `/dashboard/admin/dashboard/resolver-details/${user._id}`,
              );
            }
          }}
          className={`shrink-0 text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 rounded border transition-all duration-150 ${
            isEmployee
              ? "border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/50"
              : "border-purple-400/30 text-purple-400 hover:bg-purple-400/10 hover:border-purple-400/50"
          }`}
        >
          Details
        </button> */}
      </div>
    </div>
  );
}
