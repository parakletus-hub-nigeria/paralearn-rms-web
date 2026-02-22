"use client";

import { ReactNode, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  ClipboardList,
  Home,
  MessageSquareText,
  Settings,
  User,
  FileEdit,
  GraduationCap,
  Sparkles,
} from "lucide-react";
const logo = "/PL2 (1).svg";
import { routespath } from "@/lib/routepath";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { logoutUser } from "@/reduxToolKit/user/userThunks";

export default function TeacherSideBar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, tenantInfo } = useSelector((s: RootState) => s.user);

  const items = useMemo(
    () => [
      { label: "Dashboard", path: routespath.TEACHER_DASHBOARD, icon: Home },
      { label: "Classes", path: routespath.TEACHER_CLASSES, icon: GraduationCap },
      { label: "Assessments", path: routespath.TEACHER_ASSESSMENTS, icon: ClipboardList },
      { label: "Draft Questions", path: "/teacher/question-drafting", icon: Sparkles },
      { label: "Scores", path: routespath.TEACHER_SCORES, icon: FileEdit },
      { label: "Attendance", path: routespath.TEACHER_ATTENDANCE, icon: ClipboardList },
      { label: "Comments", path: routespath.TEACHER_COMMENTS, icon: MessageSquareText },
      { label: "Reports", path: routespath.TEACHER_REPORTS, icon: BookOpen },
      { label: "Profile", path: "/profile", icon: User },
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

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      router.push(routespath.SIGNIN);
    } catch (e: any) {
      toast.error(e || "Logout failed");
      router.push(routespath.SIGNIN);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-purple-100/50">
        <SidebarHeader className="p-5 pb-2">
          <div className="flex flex-col items-center text-center gap-1 mt-1">
            <div className="block shrink-0">
              <Image
                src={logo}
                width={930}
                height={479}
                className="h-[64px] sm:h-[72px] w-auto object-contain"
                alt="paralearn logo"
              />
            </div>
            <div className="flex flex-col leading-tight w-full px-1">
              <p className="text-[#641BC4] font-bold text-lg sm:text-lg tracking-tight line-clamp-2">
                {tenantInfo?.name || "PARA LEARN"}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex justify-center items-center gap-1.5">
                <span className="truncate">Teacher{user?.firstName ? ` • ${user.firstName}` : ""}</span>
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4">
          <nav className="flex flex-col gap-1.5 mt-4">
            {items.map((item) => {
              const isSelected = pathname === item.path;
              return (
                <Link
                  key={item.path}
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
                  <span className={`text-[15px] ${isSelected ? "font-semibold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </SidebarContent>

        <SidebarFooter className="p-4">
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
        <div className="p-10 w-full max-w-[1600px] mx-auto">
          <Toaster position="top-right" expand={false} richColors />
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

