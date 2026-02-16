import { QuestionDraftingPage } from "@/components/Teacher/QuestionDraftingPage";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
       <QuestionDraftingPage />
    </ProtectedRoute>
  );
}
