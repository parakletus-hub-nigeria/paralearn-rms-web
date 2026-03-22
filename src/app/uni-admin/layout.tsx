import UniAdminSideBar from "@/components/University/AdminSideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function UniAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["admin"]}>
        <UniAdminSideBar>{children}</UniAdminSideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}
