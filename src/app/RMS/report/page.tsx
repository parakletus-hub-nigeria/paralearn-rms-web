import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import SideBar from "@/components/RMS/sideBar";
import RoleGuard from "@/components/protectedRoute/RoleGuard";
import { AdminReportsPage } from "@/components/RMS/AdminReportsPage";
const ReportCardRender = () => {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["admin"]}>
        <SideBar>
          <AdminReportsPage />
        </SideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
};

export default ReportCardRender;
