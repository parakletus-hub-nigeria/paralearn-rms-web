"use client";

import { ReactNode, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
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
} from "lucide-react";
import logo from "@/images/IMG-20201027-WA0000_2-removebg-preview 1.png";
import { routespath } from "@/lib/routepath";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { logoutUser } from "@/reduxToolKit/user/userThunks";

export default function TeacherSideBar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.user);

  const items = useMemo(
    () => [
      { label: "Dashboard", path: routespath.TEACHER_DASHBOARD, icon: Home },
      { label: "Classes", path: routespath.TEACHER_CLASSES, icon: GraduationCap },
      { label: "Assessments", path: routespath.TEACHER_ASSESSMENTS, icon: ClipboardList },
      { label: "Scores", path: routespath.TEACHER_SCORES, icon: FileEdit },
      { label: "Comments", path: routespath.TEACHER_COMMENTS, icon: MessageSquareText },
      { label: "Reports", path: routespath.TEACHER_REPORTS, icon: BookOpen },
      { label: "Profile", path: "/profile", icon: User },
      { label: "Settings", path: "/settings", icon: Settings },
    ],
    []
  );

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
        <SidebarHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-1 rounded-lg">
              <Image
                src={logo}
                className="w-[32px] h-[32px] object-contain"
                alt="paralearn logo"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <p className="text-[#641BC4] font-bold text-lg tracking-tight">PARA LEARN</p>
              <p className="text-xs text-slate-500 font-medium">
                Teacher{user?.firstName ? ` • ${user.firstName}` : ""}
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
        <div className="p-10 w-full max-w-[1600px] mx-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}

