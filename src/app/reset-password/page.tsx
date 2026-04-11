"use client";

import { useSearchParams } from "next/navigation";
import ResetPasswordPage from "@/components/landingpage/subLandingPage/ResetPasswordPage";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const subdomain = searchParams.get("subdomain") || undefined;

  return <ResetPasswordPage code={token} subdomain={subdomain} />;
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
