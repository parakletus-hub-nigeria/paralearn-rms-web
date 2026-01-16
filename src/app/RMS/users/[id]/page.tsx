import { UserDetailPage } from "@/components/RMS/UserDetailPage";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";

export default function UserDetail() {
  return (
    <ProtectedRoute>
      <SideBar>
        <UserDetailPage />
      </SideBar>
    </ProtectedRoute>
  );
}
