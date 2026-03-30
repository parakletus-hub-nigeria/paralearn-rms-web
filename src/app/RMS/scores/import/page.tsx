import { BulkScoreImportPage } from "@/components/RMS/BulkScoreImportPage";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function BulkScoreImport() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["admin"]}>
        <SideBar>
          <BulkScoreImportPage />
        </SideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}
