import { BulkUploadPage } from "@/components/RMS/BulkUploadPage";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";

export default function BulkUpload() {
  return (
    <ProtectedRoute>
      <SideBar>
        <BulkUploadPage />
      </SideBar>
    </ProtectedRoute>
  );
}
