"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";


const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "RESOLVER") {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "RESOLVER") {
    return null;
  }

  return (
    <>
      {children}
    </>
  )
}

export default ClientWrapper;
