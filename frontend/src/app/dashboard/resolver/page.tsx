import DashBoardContent from "./_essentials/DashboardContent";
import ClientWrapper from "./_essentials/ClientWrapper";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  return (
    <ClientWrapper>
      <DashBoardContent></DashBoardContent>
    </ClientWrapper>
  );
}
