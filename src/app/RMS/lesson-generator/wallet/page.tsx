import { LessonGeneratorWallet } from "@/components/RMS/LessonGenerator/LessonGeneratorWallet";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function LessonGeneratorWalletPage() {
  return (
    <RoleGuard allow={["admin", "teacher"]}>
      <div className="p-6 sm:p-8">
        <LessonGeneratorWallet />
      </div>
    </RoleGuard>
  );
}
