// Super Admin uses API-key auth (X-Super-Admin-Key), not JWT.
// No ProtectedRoute / RoleGuard — the lock screen in SuperAdminPage handles access.
export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
