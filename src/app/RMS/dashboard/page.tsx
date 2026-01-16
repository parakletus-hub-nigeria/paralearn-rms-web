import { DashboardPage } from "@/components/RMS/DashboardPage";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <SideBar>
        <DashboardPage />
      </SideBar>
    </ProtectedRoute>
  );
}
