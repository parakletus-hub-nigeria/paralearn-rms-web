"use client";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { routespath } from "@/lib/routepath";
import tokenManager from "@/lib/tokenManager";
import { Spinner } from "@/components/ui/spinner";
import { fetchCurrentSession } from "@/reduxToolKit/setUp/setUpThunk";
import { AppDispatch } from "@/reduxToolKit/store";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const accesstoken = useSelector((state: any) => state.user.accessToken);
  const currentSession = useSelector((state: any) => state.setUp.currentSession);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathName = usePathname();

  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let tokensExisted = false;

    // We are in useEffect, so window is guaranteed to be defined
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("auth_token");
    const urlUser = urlParams.get("auth_user");

    // Intercept cross-subdomain auth transfer
    if (urlToken) {
      tokenManager.setToken(urlToken);
      if (urlUser) {
        try {
          const rawDecoded = decodeURIComponent(urlUser);
          // Only save it if it's actually valid JSON, to prevent parsing errors later
          JSON.parse(rawDecoded);
          localStorage.setItem("currentUser", rawDecoded);
        } catch (e) {
          console.error("Failed to decode/parse user data from URL", e);
        }
      }
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      tokensExisted = true;
    }

    // Check token from Redux state, cookies, or just set from URL
    const hasToken = !!accesstoken || tokenManager.hasToken() || tokensExisted;

    if (!hasToken) {
      // No token at all — send to sign-in, preserving intended destination
      router.replace(`${routespath.SIGNIN}?redirect=${encodeURIComponent(pathName)}`);
      return;
    }

    setIsAuthorized(true);

    // Fetch global academic session if not already loaded
    if (hasToken && !currentSession) {
      dispatch(fetchCurrentSession());
    }
  }, [mounted, accesstoken, pathName, router, currentSession, dispatch]);

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
