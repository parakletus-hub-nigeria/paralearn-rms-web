import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";
import BrandingPage from "@/components/RMS/BrandingPage";

export default function Branding() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["admin"]}>
        <SideBar>
          <BrandingPage />
        </SideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}
