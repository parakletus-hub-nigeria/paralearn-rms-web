"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { routespath } from "@/lib/routepath";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/reduxToolKit/store";
import { getCurrentUserProfile, logoutUser } from "@/reduxToolKit/user/userThunks";
import tokenManager from "@/lib/tokenManager";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

type RoleGuardProps = {
  children: ReactNode;
  allow: Array<"admin" | "teacher" | "student">;
  mode?: "block" | "redirect";
  redirectTo?: string; // only used in redirect mode
};

export default function RoleGuard({
  children,
  allow,
  mode = "block",
  redirectTo,
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector((s: any) => s.user?.user?.roles || []);
  const userLoading = useSelector((s: any) => s.user?.loading);
  const [checkedProfile, setCheckedProfile] = useState(false);
  const didKickoff = useRef(false);

  const ok = useMemo(
    () => Array.isArray(roles) && roles.some((r: string) => allow.includes(r)),
    [roles, allow]
  );

  const hasToken = !!(tokenManager.getToken());

  // If we have a token but roles are empty (e.g. page refresh), fetch /users/me once.
  useEffect(() => {
    if (!hasToken) return;
    if (ok) return;
    if (didKickoff.current) return;
    if (Array.isArray(roles) && roles.length > 0) return;
    didKickoff.current = true;
    dispatch(getCurrentUserProfile())
      .unwrap()
      .catch(() => {})
      .finally(() => setCheckedProfile(true));
  }, [dispatch, hasToken, ok, roles]);

  // If roles are still empty after attempting profile fetch, stop showing blank.
  useEffect(() => {
    if (!hasToken) return;
    if (Array.isArray(roles) && roles.length > 0) return;
    if (didKickoff.current && !userLoading) setCheckedProfile(true);
  }, [hasToken, roles, userLoading]);

  useEffect(() => {
    // only auto-redirect in redirect mode
    // default to block to avoid “empty screen” confusion
    if (mode !== "redirect") return;
    if (ok) return;
    const fallback =
      redirectTo ||
      (roles.includes("teacher") ? routespath.TEACHER_DASHBOARD : routespath.DASHBOARD);
    if (pathname !== fallback) router.replace(fallback);
  }, [ok, router, redirectTo, roles, pathname, mode]);

  // While roles are being resolved after refresh
  if (hasToken && Array.isArray(roles) && roles.length === 0 && !checkedProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-8" />
          <p className="text-slate-600 font-medium">Loading your access…</p>
        </div>
      </div>
    );
  }

  if (!ok) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="max-w-lg w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-2xl font-black text-slate-900">Unauthorized</p>
          <p className="text-slate-500 mt-2">
            You don’t have permission to access this page with your current account.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-slate-200"
              onClick={() => router.back()}
            >
              Go back
            </Button>
            <Button
              className="h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white"
              onClick={async () => {
                try {
                  await dispatch(logoutUser()).unwrap();
                } catch {}
                router.replace(routespath.SIGNIN);
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

