import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";
import { AdminClassesPage } from "@/components/RMS/AdminClassesPage";

export default function ClassesPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["admin", "teacher"]}>
        <SideBar>
          <AdminClassesPage />
        </SideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}

