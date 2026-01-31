<<<<<<< HEAD
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

=======
import { AcademicSessionsPage } from "@/components/RMS/AcademicSessionsPage";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";

export default function Academic() {
  return (
    <ProtectedRoute>
      <SideBar>
        <AcademicSessionsPage />
      </SideBar>
    </ProtectedRoute>
  );
}
>>>>>>> 5ec093b344819d4434f11ae1cb6aadc4b50f3fff
