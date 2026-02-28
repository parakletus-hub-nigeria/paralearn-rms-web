"use client";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { routespath } from "@/lib/routepath";
import tokenManager from "@/lib/tokenManager";
import { Spinner } from "@/components/ui/spinner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const accesstoken = useSelector((state: any) => state.user.accessToken);
  const router = useRouter();
  const pathName = usePathname();

  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check token from both Redux state and cookies
    const hasToken = !!accesstoken || tokenManager.hasToken();

    if (!hasToken) {
      // No token at all — send to sign-in, preserving intended destination
      router.replace(`${routespath.SIGNIN}?redirect=${encodeURIComponent(pathName)}`);
      return;
    }

    setIsAuthorized(true);
  }, [mounted, accesstoken, pathName, router]);

  // SSR / pre-mount: render nothing to avoid hydration mismatch
  if (!mounted) return null;

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center justify-center gap-4">
          <Spinner className="size-8" />
          <p className="text-lg font-medium text-slate-700">
            Verifying your access...
          </p>
          <p className="text-sm text-slate-500">Please wait</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
