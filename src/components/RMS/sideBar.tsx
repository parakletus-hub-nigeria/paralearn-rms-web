"use client";
import { ReactNode, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  Palette,
} from "lucide-react";
import { routespath } from "@/lib/routepath";
import Link from "next/link";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { logoutUser } from "@/reduxToolKit/user/userThunks";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { LogoutConfirmModal } from "@/components/auth/LogoutConfirmModal";

const SideBar = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, tenantInfo } = useSelector((s: RootState) => s.user);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logoutUser()).unwrap();

      // Show success message
      toast.success("Logged out successfully");

      // Redirect to signin page
      router.push(routespath.SIGNIN);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const sideBarContent = useMemo(
    () => [
      { label: "Dashboard", path: routespath.DASHBOARD, icon: Home, roles: ["admin", "teacher"] },
      { label: "Users", path: routespath.USERS, icon: UserCircle, roles: ["admin"] },
      { label: "Enrollments", path: routespath.ENROLLMENTS, icon: UserPlus, roles: ["admin"] },
      { label: "Classes", path: routespath.CLASSES, icon: BookOpenCheck, roles: ["admin", "teacher"] },
      { label: "Subjects", path: routespath.SUBJECTS, icon: BookOpen, roles: ["admin", "teacher"] },
      { label: "Assessments", path: routespath.ASSESSMENTS, icon: ClipboardList, roles: ["admin", "teacher"] },
      { label: "Report Cards", path: routespath.REPORT, icon: BookOpen, roles: ["admin", "teacher"] },
      { label: "Comments", path: routespath.COMMENTS, icon: MessageSquareText, roles: ["admin", "teacher"] },
      { label: "Attendance", path: routespath.ATTENDANCE, icon: Calendar, roles: ["admin", "teacher"] },
      { label: "Bulk Upload", path: routespath.BULK_UPLOAD, icon: DownloadIcon, roles: ["admin"] },
      { label: "Academic", path: routespath.ACADEMIC, icon: Calendar, roles: ["admin"] },
      { label: "School Settings", path: routespath.SCHOOL_SETTINGS, icon: Settings, roles: ["admin"] },
      { label: "Branding", path: routespath.BRANDING, icon: Palette, roles: ["admin"] },
      { label: "Profile", path: "/profile", icon: User, roles: ["admin", "teacher"] },
      { label: "Settings", path: "/settings", icon: Settings, roles: ["admin", "teacher"] },
    ],
    []
  );

  const filteredContent = useMemo(() => {
    return sideBarContent.filter(item => {
      if (!item.roles) return true;
      const userRoles = user?.roles || [];
      return item.roles.some(r => userRoles.includes(r));
    });
  }, [sideBarContent, user?.roles]);

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
      <SidebarContentContainer 
        logo={logo} 
        tenantInfo={tenantInfo} 
        user={user} 
        filteredContent={filteredContent} 
        pathname={pathname} 
        handleLogout={() => setIsLogoutModalOpen(true)}
      >
        {children}
      </SidebarContentContainer>
      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        loading={isLoggingOut}
      />
    </SidebarProvider>
  );
};

const SidebarContentContainer = ({ 
  children, 
  logo, 
  tenantInfo, 
  user, 
  filteredContent, 
  pathname, 
  handleLogout 
}: { 
  children: ReactNode;
  logo: string;
  tenantInfo: any;
  user: any;
  filteredContent: any[];
  pathname: string;
  handleLogout: () => void;
}) => {
  // const { open, openMobile } = useSelector((s: RootState) => ({
  //   // Note: We can't actually use useSidebar here if we want to determine 
  //   // the layout *outside* the Sidebar component perfectly without hydration issues,
  //   // but the SidebarProvider is already wrapping this.
  // }));
  
  // Actually, we must import useSidebar inside the component
  const { SidebarTrigger: UI_SidebarTrigger, useSidebar } = require("../ui/sidebar");
  const { open: isExpanded, isMobile } = useSidebar();

  return (
    <>
      <Sidebar className="border-r border-purple-100/50 bg-white">
        <SidebarHeader className="p-4 sm:p-5 pb-2 relative">
          <div className="absolute top-2 right-2 hidden md:block">
            <SidebarTrigger className="hover:bg-purple-50 h-8 w-8 text-slate-500" />
          </div>
          <div className="flex flex-col items-center text-center gap-1 mt-2">
            <Link href={routespath.DASHBOARD} className="block shrink-0">
              <Image
                src={logo}
                width={930}
                height={479}
                className="h-[64px] sm:h-[72px] w-auto object-contain"
                alt="paralearn logo"
              />
            </Link>
            <div className="flex flex-col leading-tight w-full px-1">
              <p className="text-[#641BC4] font-bold text-lg sm:text-lg tracking-tight line-clamp-2">
                {tenantInfo?.name || "ParaLearn"}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex justify-center items-center gap-1.5">
                <span className="truncate">{user?.roles?.[0]?.charAt(0).toUpperCase() + user?.roles?.[0]?.slice(1) || "User"}{user?.firstName ? ` • ${user.firstName}` : ""}</span>
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4">
          <nav className="flex flex-col gap-1.5 mt-4">
            {filteredContent.map((item, index) => {
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
        {/* Only show the 'outside' trigger if the sidebar is NOT expanded or if we are on mobile */}
        {(!isExpanded || isMobile) && (
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
            <SidebarTrigger className="hover:bg-purple-50 h-9 w-9 sm:h-10 sm:w-10" />
          </div>
        )}
        <div className="px-4 py-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto">
          <Toaster position="top-right" expand={false} richColors />
          {children}
        </div>
      </main>
    </>
  );
};

export default SideBar;
