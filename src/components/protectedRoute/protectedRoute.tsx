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
import {
  hydrateUserState,
  updateInstitutionType,
} from "@/reduxToolKit/user/userSlice";
import { normalizeRoles } from "@/reduxToolKit/user/userUtils";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const accesstoken = useSelector((state: any) => state.user.accessToken);
  const currentSession = useSelector((state: any) => state.setUp.currentSession);
  // Used as a fallback on hard-refresh (no URL params) to skip the K12 session fetch
  const reduxInstitutionType = useSelector(
    (state: any) => state.user.institutionType as "k12" | "university" | undefined,
  );
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
    // Track institution type locally so we can gate K12-only calls below.
    // URL params are the source-of-truth on fresh subdomain redirects;
    // Redux state is the fallback on hard-refreshes (no URL params present).
    let localInstitutionType: "k12" | "university" = reduxInstitutionType ?? "k12";

    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("auth_token");
    const urlUser = urlParams.get("auth_user");

    // ── Cross-subdomain auth handoff ────────────────────────────────────────
    // When the login page redirects to a subdomain URL it passes the token and
    // user object as URL params (the cookie is cross-subdomain, but localStorage
    // and Redux are fresh on the new origin).
    if (urlToken) {
      // 1. Persist token to cookie (set on .domain so all subdomains share it)
      tokenManager.setToken(urlToken);

      let parsedUser: any = null;

      if (urlUser) {
        try {
          const rawDecoded = decodeURIComponent(urlUser);
          parsedUser = JSON.parse(rawDecoded);
          // Write to localStorage on THIS origin so future hard-refreshes can read it
          localStorage.setItem("currentUser", rawDecoded);
        } catch (e) {
          console.error("[ProtectedRoute] Failed to parse auth_user from URL", e);
        }
      }

      // 2. Immediately hydrate Redux so RoleGuard has roles without an extra fetch
      if (parsedUser) {
        let roles = normalizeRoles(parsedUser?.roles);
        if (roles.length === 0) roles = normalizeRoles(parsedUser);

        const institutionType: "k12" | "university" =
          parsedUser?.institutionType === "university" ? "university" : "k12";

        // Keep local copy in sync so the K12 session-fetch gate below is correct
        localInstitutionType = institutionType;

        dispatch(
          hydrateUserState({
            accessToken: urlToken,
            user: {
              id: parsedUser.id || "",
              email: parsedUser.email || "",
              firstName: parsedUser.firstName || "",
              lastName: parsedUser.lastName || "",
              schoolId: parsedUser.schoolId || "",
              universityId: parsedUser.universityId || "",
              roles,
              avatar: parsedUser.avatar || parsedUser.profilePicture || "",
            },
            subdomain: parsedUser.subdomain || null,
            institutionType,
          }),
        );

        // Keep institutionType in sync for uniBaseApi header injection
        dispatch(updateInstitutionType(institutionType));
      } else {
        // No user payload — at least put the token into Redux
        dispatch(hydrateUserState({ accessToken: urlToken, user: {} }));
      }

      // 3. Remove params from the address bar
      window.history.replaceState({}, document.title, window.location.pathname);
      tokensExisted = true;
    }

    // ── Auth gate ───────────────────────────────────────────────────────────
    const hasToken = !!accesstoken || tokenManager.hasToken() || tokensExisted;

    if (!hasToken) {
      router.replace(`${routespath.SIGNIN}?redirect=${encodeURIComponent(pathName)}`);
      return;
    }

    setIsAuthorized(true);

    // K12 only: fetch the academic session for session-aware routing.
    // University users do not have academic sessions on the K12 backend.
    if (hasToken && !currentSession && localInstitutionType !== "university") {
      dispatch(fetchCurrentSession());
    }
  }, [mounted, accesstoken, pathName, router, currentSession, dispatch, reduxInstitutionType]);

  // SSR guard — avoid hydration mismatch
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
