"use client";
import { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/state/user/userSlice";
import { toast } from "react-toastify";
import tokenManager from "@/lib/tokenManager";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "../ui/sidebar";
import Image from "next/image";
import logo from "../../../public/mainLogo.svg";

import {
  Home,
  UserCircle,
  BookOpen,
  DownloadIcon,
  User,
  Settings,
  Calendar,
} from "lucide-react";
import { routespath } from "@/lib/routepath";
import Link from "next/link";

const SideBar = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Clear Redux state
      dispatch(logout());

      // Clear token from cookie
      tokenManager.removeToken();

      // Clear localStorage
      localStorage.clear();

      // Show success message
      toast.success("Logged out successfully");

      // Redirect to signin page
      setTimeout(() => {
        router.push(routespath.SIGNIN);
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const sideBarContent = [
    { label: "Dashboard", path: routespath.DASHBOARD, icon: Home },
    { label: "Academic", path: routespath.ACADEMIC, icon: Calendar },
    { label: "Users", path: routespath.USERS, icon: UserCircle },
    { label: "Report Cards", path: routespath.REPORT, icon: BookOpen },
    { label: "Bulk Upload", path: routespath.BULK_UPLOAD, icon: DownloadIcon },
    { label: "Profile", path: "/RMS/profile", icon: User },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-purple-100/50 bg-white">
        <SidebarHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Link href={routespath.DASHBOARD} className="block">
              <Image
                src={logo}
                className="h-auto w-[120px] sm:w-[140px] md:w-[160px] max-w-full object-contain"
                alt="paralearn logo"
              />
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4">
          <nav className="flex flex-col gap-1.5 mt-4">
            {sideBarContent.map((item, index) => {
              // Check if current pathname matches the item path
              const isSelected = pathname === item.path || pathname?.startsWith(item.path + "/");
              return (
                <Link
                  key={index}
                  href={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isSelected
                      ? "bg-[var(--purple-light)] text-[var(--brand-primary)] shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon
                    className={`w-[18px] h-[18px] transition-transform duration-300 ${
                      isSelected ? "scale-110" : "group-hover:translate-x-0.5"
                    }`}
                  />
                  <span
                    className={`text-[15px] ${
                      isSelected ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </SidebarContent>
        <SidebarFooter>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-3 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200 cursor-pointer"
          >
            Logout
          </button>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 bg-[#fbfaff] min-h-screen relative overflow-x-hidden">
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
          <SidebarTrigger className="hover:bg-purple-50 h-9 w-9 sm:h-10 sm:w-10" />
        </div>
        <div className="px-4 py-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
};

export default SideBar;
