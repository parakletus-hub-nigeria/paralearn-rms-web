"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { decodeToken } from "@/lib/jwt-decode";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { routespath } from "@/lib/routepath";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const accesstoken = useSelector((state: any) => state.user.accessToken);
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    if (!accesstoken) {
      toast.info("Please sign in to access this page.");
      if (pathName !== routespath.SIGNIN) {
        setTimeout(() => {
          router.push(routespath.SIGNIN);
        }, 1000);
      }
      return;
    }
    if (decodeToken(accesstoken) === false) {
      toast.info("Session expired. Please sign in again.");
      if (pathName == routespath.SIGNIN) {
        setTimeout(() => {
          router.push(routespath.SIGNIN);
        }, 1000);
      }
      return;
    }
  }, [accesstoken, pathName, router]);
  if (!accesstoken || decodeToken(accesstoken) === false) {
    return (
      <div>
        <ToastContainer />
        Loading...
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
