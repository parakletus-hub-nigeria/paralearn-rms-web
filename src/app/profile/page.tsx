import { ProfilePage } from "@/components/RMS/ProfilePage";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";

export default function Profile() {
  return (
    <ProtectedRoute>
      <SideBar>
        <ProfilePage />
      </SideBar>
    </ProtectedRoute>
  );
}
