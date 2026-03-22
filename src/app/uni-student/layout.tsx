import UniStudentSideBar from "@/components/University/StudentSideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function UniStudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["student"]}>
        <UniStudentSideBar>{children}</UniStudentSideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}
