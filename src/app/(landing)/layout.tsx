import { Toaster } from "sonner";

export default function LandingGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster position="top-right" expand={false} richColors />
      {children}
    </>
  );
}
