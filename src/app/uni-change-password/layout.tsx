import ProtectedRoute from "@/components/protectedRoute/protectedRoute";

export default function UniChangePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
