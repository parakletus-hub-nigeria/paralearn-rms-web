import { Suspense } from "react";
import UniResetPasswordClient from "./UniResetPasswordClient";

export default function UniResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <UniResetPasswordClient />
    </Suspense>
  );
}
