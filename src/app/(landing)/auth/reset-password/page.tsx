"use client";

import { useSearchParams } from "next/navigation";
import ResetPasswordPage from "@/components/landingpage/subLandingPage/ResetPasswordPage";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  return <ResetPasswordPage code={token} />;
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
