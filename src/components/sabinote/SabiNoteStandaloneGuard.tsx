"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { hydrateToken } from "@/reduxToolKit/sabiStandaloneAuth/sabiStandaloneAuthSlice";
import { routespath } from "@/lib/routepath";
import { Spinner } from "@/components/ui/spinner";

export default function SabiNoteStandaloneGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((s: RootState) => s.sabiStandaloneAuth);

  useEffect(() => {
    dispatch(hydrateToken());
  }, [dispatch]);

  useEffect(() => {
    // After hydration: if still no token, redirect to login
    const stored = typeof window !== "undefined" ? localStorage.getItem("sabiStandaloneToken") : null;
    if (token === null && !stored) {
      router.replace(routespath.SABINOTE_LOGIN);
    }
  }, [token, router]);

  const stored = typeof window !== "undefined" ? localStorage.getItem("sabiStandaloneToken") : null;
  if (!token && !stored) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner className="size-8 text-purple-600" />
      </div>
    );
  }

  return <>{children}</>;
}
