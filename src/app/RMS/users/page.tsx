import { UsersPage } from "@/components/RMS/UsersPage";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";

export default function Users() {
  return (
    <ProtectedRoute>
      <SideBar>
        <UsersPage />
      </SideBar>
    </ProtectedRoute>
  );
}
