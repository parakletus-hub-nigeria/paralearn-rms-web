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
        if (!accesstoken) {
          // try to get a new accessToken from refresh endpoint
          const refreshResponse = await apiFetch(
            "/api/proxy/auth/refresh-token",
            { method: "GET" }
          );
          const refresh = await refreshResponse.json();

          if (
            !refreshResponse.ok ||
            refresh.status == 401 ||
            !tokenManager.getToken
          ) {
            throw new Error("token not found");
          }
          dispatch(updateAccessToken({ accessToken: accesstoken }));
        }
        if (decodeToken(accesstoken) === false) {
          // try to get a new accessToken from refresh endpoint
          const refreshResponse = await apiFetch(
            "/api/proxy/auth/refresh-token",
            { method: "GET" }
          );
          const refresh = await refreshResponse.json();
          console.log("...decoding");
          if (
            !refreshResponse.ok ||
            refresh.statusCode == "401" ||
            !decodeToken(accesstoken)
          ) {
            throw new Error("token expired");
          }
        }
        setIsAuthorized(true);
      } catch (error) {
        if (error) {
          console.log(error);
          setIsAuthorized(false);
          toast.info("Please sign in to access this page.");
          if (pathName !== routespath.SIGNIN) {
            setTimeout(() => {
              router.push(routespath.SIGNIN);
            }, 1000);
          }
        }
      }
    };

    verifyToken();
  }, [accesstoken, pathName, router]);
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
