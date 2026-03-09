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
