"use client";
import { ReactNode, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
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
import logo from "../../images/IMG-20201027-WA0000_2-removebg-preview 1.png";
import {
  Home,
  UserCircle,
  BookOpen,
  DownloadIcon,
  User,
  Settings,
} from "lucide-react";
import { routespath } from "@/lib/routepath";
import Link from "next/link";

const SideBar = ({ children }: { children: ReactNode }) => {
  const [selectedPath, setSelectedPath] = useState("/dashboard");
  const dispatch = useDispatch();
  const router = useRouter();

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
    {
      label: "Dashboard",
      path: routespath.DASHBOARD,
      icon: Home,
    },
    {
      label: "Users",
      path: "/RMS/users",
      icon: UserCircle,
    },
    {
      label: "Report Cards",
      path: routespath.REPORT,
      icon: BookOpen,
    },
    {
      label: "Bulk Upload",
      path: "/RMS/bulk_upload",
      icon: DownloadIcon,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: User,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-purple-100/50">
        <SidebarHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-1 rounded-lg">
              <Image
                src={logo}
                className="w-[32px] h-[32px] object-contain"
                alt="paralearn logo"
              />
            </div>
            <p className="text-[#641BC4] font-bold text-lg tracking-tight">
              PARA LEARN
            </p>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4">
          <nav className="flex flex-col gap-1.5 mt-4">
            {sideBarContent.map((item, index) => {
              const isSelected = selectedPath === item.path;
              return (
                <Link
                  key={index}
                  href={items.path}
                  onClick={() => setSelectedPath(items.path)}
                  className={`flex flex-row items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isSelected
                      ? "bg-[#EDEAFB] text-[#641BC4] font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
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
          </div>
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

      <main className="flex-1 bg-[#fbfaff] min-h-screen relative">
        <div className="absolute top-6 left-6 z-50">
          <SidebarTrigger className="hover:bg-purple-50" />
        </div>
        <div className="p-10 w-full max-w-[1600px] mx-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
};

export default SideBar;
