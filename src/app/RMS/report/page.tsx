import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import { ReportCardAdminPage } from "@/components/Report/report-card-admin-page";
import SideBar from "@/components/RMS/sideBar";
const ReportCardRender = () => {
  return (
    <ProtectedRoute>
      <SideBar>
      <ReportCardAdminPage />
    </SideBar>
    </ProtectedRoute>
  );
};

export default ReportCardRender;
