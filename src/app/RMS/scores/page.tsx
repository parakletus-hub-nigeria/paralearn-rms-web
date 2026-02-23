import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";
import { AdminScoresPage } from "@/components/RMS/AdminScoresPage";

export default function ScoresPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["admin", "teacher"]}>
        <SideBar>
          <AdminScoresPage />
        </SideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}

