"use client";
import { ReactNode, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "../ui/sidebar";
import Image from "next/image";
const logo = "/PL2 (1).svg";

import {
  BookOpenCheck,
  Calendar,
  ClipboardList,
  Home,
  UserCircle,
  BookOpen,
  DownloadIcon,
  MessageSquareText,
  UserPlus,
  User,
  Settings,
} from "lucide-react";
import { routespath } from "@/lib/routepath";
import Link from "next/link";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { logoutUser } from "@/reduxToolKit/user/userThunks";
import { usePathname } from "next/navigation";

const SideBar = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, tenantInfo } = useSelector((s: RootState) => s.user);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

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

  const sideBarContent = useMemo(
    () => [
      { label: "Dashboard", path: routespath.DASHBOARD, icon: Home },
      { label: "Users", path: routespath.USERS, icon: UserCircle },
      { label: "Enrollments", path: routespath.ENROLLMENTS, icon: UserPlus },
      { label: "Classes", path: routespath.CLASSES, icon: BookOpenCheck },
      { label: "Subjects", path: routespath.SUBJECTS, icon: BookOpen },
      { label: "Assessments", path: routespath.ASSESSMENTS, icon: ClipboardList },
      { label: "Report Cards", path: routespath.REPORT, icon: BookOpen },
      { label: "Comments", path: routespath.COMMENTS, icon: MessageSquareText },
      { label: "Attendance", path: routespath.ATTENDANCE, icon: Calendar },
      { label: "Bulk Upload", path: routespath.BULK_UPLOAD, icon: DownloadIcon },
      { label: "Academic", path: routespath.ACADEMIC, icon: Calendar },
      { label: "School Settings", path: routespath.SCHOOL_SETTINGS, icon: Settings },
      { label: "Profile", path: "/profile", icon: User },
      { label: "Settings", path: "/settings", icon: Settings },
    ],
    []
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-purple-100/50 bg-white">
        <SidebarHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Link href={routespath.DASHBOARD} className="block shrink-0">
              <Image
                src={logo}
                width={930}
                height={479}
                className="h-auto w-[100px] sm:w-[110px] md:w-[120px] max-w-full object-contain"
                alt="paralearn logo"
              />
            </Link>
            <div className="flex flex-col leading-tight">
              <p className="text-[#641BC4] font-bold text-lg tracking-tight">{tenantInfo?.name || "PARA LEARN"}</p>
              <p className="text-xs text-slate-500 font-medium">
                Admin{user?.firstName ? ` • ${user.firstName}` : ""}
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4">
          <nav className="flex flex-col gap-1.5 mt-4">
            {sideBarContent.map((item, index) => {
              const isSelected = pathname === item.path;
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
