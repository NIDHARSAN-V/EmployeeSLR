"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

interface Ticket {
  refId: string;
  request_type: string;
  status: string;
  deadlineType: string;
  isOverdue: boolean;
}

interface SLAContextType {
  slaData: Ticket[];
}

const SLAContext = createContext<SLAContextType | null>(null);
// sla provider to fetch SLA breached tickets every 10 seconds
export function SLAProvider({ children }: { children: React.ReactNode }) {
  const [slaData, setSlaData] = useState<Ticket[]>([]);

  useEffect(() => {

    const fetchSLAData = async () => {
      try {

        const response = await fetch(apiUrl("/notifications/sla-breached/tickets"));

        const data = await response.json();

        const newData = data.items;

        const oldData = JSON.stringify(slaData);
        const incoming = JSON.stringify(newData);

        if (oldData !== incoming) {
          console.log("Updating SLA Data");
          setSlaData(newData);
        }

      } catch (error) {
        console.error("SLA fetch error:", error);
      }
    };

    fetchSLAData();

    const interval = setInterval(fetchSLAData, 10000);

    return () => clearInterval(interval);

  }, [slaData]);

  return (
    <SLAContext.Provider value={{ slaData }}>
      {children}
    </SLAContext.Provider>
  );
}
// global hook for SLA context
export function useSLA() {
  const context = useContext(SLAContext);
  if (!context) throw new Error("useSLA must be used inside SLAProvider");
  return context;
}