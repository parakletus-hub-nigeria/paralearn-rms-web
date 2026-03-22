import UniLecturerSideBar from "@/components/University/LecturerSideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function UniLecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["lecturer"]}>
        <UniLecturerSideBar>{children}</UniLecturerSideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}
