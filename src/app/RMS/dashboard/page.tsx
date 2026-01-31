import { DashboardPage } from "@/components/RMS/DashboardPage";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["admin"]}>
        <SideBar>
          <DashboardPage />
        </SideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}
