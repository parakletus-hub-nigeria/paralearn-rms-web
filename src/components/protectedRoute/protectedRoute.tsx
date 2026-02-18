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
import { getSubdomain } from "@/lib/subdomainManager";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // AUTHENTICATION TEMPORARILY DISABLED
  // const accesstoken = useSelector((state: any) => state.user.accessToken);
  const accesstoken = useSelector((state: any) => state.user.accessToken);
  const reduxSubdomain = useSelector((state: any) => state.user.subdomain);
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();
  
  // Authorization set to true to bypass verify token logic as per user request (temporary disable)
  const [isAuthorized, setIsAuthorized] = useState(true);

  // AUTHENTICATION LOGIC TEMPORARILY DISABLED
  // logic removed to fix build errors 
  
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
  return (
    <>

      {children}
    </>
  );
};

export default ProtectedRoute;
