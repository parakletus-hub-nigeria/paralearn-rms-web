import { SettingsPage } from "@/components/RMS/SettingsPage";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";

export default function Settings() {
  return (
    <ProtectedRoute>
      <SideBar>
        <SettingsPage />
      </SideBar>
    </ProtectedRoute>
  );
}
