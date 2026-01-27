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
