"use client";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { decodeToken } from "@/lib/jwt-decode";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { routespath } from "@/lib/routepath";
import tokenManager from "@/lib/tokenManager";
import { updateAccessToken } from "@/reduxToolKit/user/userSlice";
import { apiFetch } from "@/lib/interceptor";
import { Spinner } from "@/components/ui/spinner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // const accesstoken = useSelector((state: any) => state.user.accessToken);
  const accesstoken = useSelector((state: any) => state.user.accessToken);
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Check if token exists in Redux state
        let currentToken = accesstoken;

        // If no token in Redux, try to get from cookies
        if (!currentToken || currentToken === null) {
          currentToken = tokenManager.getToken();

          // If still no token, try to refresh
          if (!currentToken) {
            try {
              const refreshResponse = await apiFetch(
                `/api/proxy${routespath.API_REFRESH}`,
                { method: "GET", credentials: "include" }
              );

              if (!refreshResponse.ok) {
                throw new Error("Refresh token failed");
              }

              const refresh = await refreshResponse.json();

              // Extract token from response or cookies
              const newToken =
                refresh.accessToken ||
                refresh.data?.accessToken ||
                tokenManager.getToken();

              if (
                !newToken ||
                refresh.status === 401 ||
                refresh.statusCode === "401"
              ) {
                throw new Error("token not found");
              }

              // Update Redux state with new token
              dispatch(updateAccessToken({ accessToken: newToken }));
              currentToken = newToken;
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              setIsAuthorized(false);
              toast.info("Please sign in to access this page.");
              if (pathName !== routespath.SIGNIN) {
                setTimeout(() => {
                  router.push(routespath.SIGNIN);
                }, 1000);
              }
              return;
            }
          } else {
            // Token found in cookies but not in Redux, update Redux
            dispatch(updateAccessToken({ accessToken: currentToken }));
          }
        }

        // Verify token is valid (not expired)
        if (currentToken && decodeToken(currentToken) === false) {
          // Token expired, try to refresh
          try {
            const refreshResponse = await apiFetch(
              `/api/proxy${routespath.API_REFRESH}`,
              { method: "GET", credentials: "include" }
            );

            if (!refreshResponse.ok) {
              throw new Error("Refresh token failed");
            }

            const refresh = await refreshResponse.json();

            // Extract new token from response or cookies
            const newToken =
              refresh.accessToken ||
              refresh.data?.accessToken ||
              tokenManager.getToken();

            if (
              !newToken ||
              refresh.status === 401 ||
              refresh.statusCode === "401"
            ) {
              throw new Error("token expired");
            }

            // Verify new token is valid
            if (decodeToken(newToken) === false) {
              throw new Error("refreshed token is also expired");
            }

            // Update Redux state with new token
            dispatch(updateAccessToken({ accessToken: newToken }));
            currentToken = newToken;
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            setIsAuthorized(false);
            toast.info("Please sign in to access this page.");
            if (pathName !== routespath.SIGNIN) {
              setTimeout(() => {
                router.push(routespath.SIGNIN);
              }, 1000);
            }
            return;
          }
        }

        // All checks passed
        setIsAuthorized(true);
      } catch (error) {
        console.error("Token verification error:", error);
        setIsAuthorized(false);
        toast.info("Please sign in to access this page.");
        if (pathName !== routespath.SIGNIN) {
          setTimeout(() => {
            router.push(routespath.SIGNIN);
          }, 1000);
        }
      }
    };

    verifyToken();
  }, [accesstoken, pathName, router, dispatch]);
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <ToastContainer />
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
  return (
    <>
      <ToastContainer />
      {children}
    </>
  );
};

export default ProtectedRoute;
