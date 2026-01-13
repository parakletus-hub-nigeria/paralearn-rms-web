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
      <Sidebar>
        <SidebarHeader>
          <div className="w-full flex items-center gap-3 p-3">
            <Image
              src={logo}
              className="w-[40px] sm:w-[40px]"
              alt="paralearn logo"
            />
            <p className="text-black font-semibold">PARA LEARN</p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="flex flex-col gap-2 p-2">
            {sideBarContent.map((items, index) => {
              const isSelected = selectedPath === items.path;
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
                  <items.icon className="w-5 h-5" />
                  <span>{items.label}</span>
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
      <main className="my-[50px] mx-[20px] w-[100%]">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default SideBar;
