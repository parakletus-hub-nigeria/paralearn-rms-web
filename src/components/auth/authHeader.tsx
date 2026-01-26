"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "../../../public/mainLogo.svg";
import { routespath } from "@/lib/routepath";

const AuthHeader = () => {
  const pathname = usePathname();
  const isAuthPage = pathname === routespath.SIGNUP || pathname === routespath.SIGNIN;
  const isSetupPage = pathname === "/setup";

  return (
    <div className="flex flex-row items-center justify-between bg-white w-[100vw] ">
      <div className="min-w-0 flex shrink items-center justify-start p-2 sm:w-[20%]">
        <Link href="/" className="block">
          <Image
            src={logo}
            className="h-auto max-w-full w-[160px] sm:w-[130px] md:w-[140px]"
            alt="paralearn logo"
          />
        </Link>
      </div>
      {!isAuthPage && !isSetupPage && (
        <div className="flex flex-row items-center flex-shrink-0 gap-2 sm:gap-4 md:gap-5 pr-3 sm:pr-4">
          <Link href={routespath.SIGNIN} className="min-w-0">
            <button className="px-3 py-2.5 text-sm font-semibold text-[#641BC4] sm:px-4 sm:py-2.5 sm:text-base md:px-[15px] md:py-[10px] md:text-lg rounded-lg active:opacity-80 transition-opacity whitespace-nowrap touch-manipulation">
              Sign in
            </button>
          </Link>
          <Link href={routespath.SIGNUP} className="min-w-0 shrink-0">
            <button className="px-3 py-2.5 text-sm font-semibold text-white bg-[#641BC4] sm:px-4 sm:py-2.5 sm:text-base md:px-[15px] md:py-[10px] md:text-lg rounded-lg active:opacity-90 transition-opacity whitespace-nowrap touch-manipulation">
              Get Started
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthHeader;
