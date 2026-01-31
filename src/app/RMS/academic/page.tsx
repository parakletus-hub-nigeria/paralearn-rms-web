import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";
import SideBar from "@/components/RMS/sideBar";
import { SchoolSetupWizard } from "@/components/wizard/school-setup-wizard";

export default function AcademicSettings() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["admin"]}>
        <SideBar>
          <SchoolSetupWizard />
        </SideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}

