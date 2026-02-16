import { QuestionDraftingPage } from "@/components/Teacher/QuestionDraftingPage";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";

import { Suspense } from "react";

export default function Page() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>}>
        <QuestionDraftingPage />
      </Suspense>
    </ProtectedRoute>
  );
}
