"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import './globals.css';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();

  const publicRoutes = ["/login", "/register"];

  useEffect(() => {
    if (!loading) {
      if (!user && !publicRoutes.includes(path)) {
        router.push("/login");
      }
    }
  }, [user, loading, path]);






  
  useEffect(() => {

    const fetchSLAData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/notifications/deadline/69ae8a5ca68f86c36e841f54"
        );
        const data = await response.json();

        console.log("SLA Data:", data);
      } catch (error) {
        console.error("Error fetching SLA tracking data:", error);
      }
    };

 
    fetchSLAData();

   
    const interval = setInterval(fetchSLAData, 10000);

    
    return () => clearInterval(interval);

  }, []);









  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
}








export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AuthProvider>
          <AuthWrapper>{children}</AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
