import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";
import { AdminSchoolSettingsPage } from "@/components/RMS/AdminSchoolSettingsPage";

export default function SchoolSettings() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["admin"]}>
        <SideBar>
          <AdminSchoolSettingsPage />
        </SideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}

