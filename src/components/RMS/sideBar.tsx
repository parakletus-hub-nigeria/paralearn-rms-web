"use client";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
  useSidebar,
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
  LogOut,
} from "lucide-react";
import { routespath } from "@/lib/routepath";
import Link from "next/link";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { logoutUser } from "@/reduxToolKit/user/userThunks";
import { usePathname } from "next/navigation";
import { LogoutConfirmModal } from "@/components/auth/LogoutConfirmModal";
import ComingSoonModal from "@/components/landingpage/ComingSoonModal";

const SideBar = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, tenantInfo } = useSelector((s: RootState) => s.user);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);

  const { token: standaloneToken, user: standaloneUser } = useSelector((s: RootState) => s.sabiStandaloneAuth);
  const isStandalone = !!standaloneToken || (typeof window !== "undefined" && !!localStorage.getItem("sabiStandaloneToken"));

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (isStandalone) {
        const { standaloneLogout } = await import("@/reduxToolKit/sabiStandaloneAuth/sabiStandaloneAuthThunks");
        await dispatch(standaloneLogout()).unwrap();
        router.push(routespath.SABINOTE_LOGIN);
      } else {
        await dispatch(logoutUser()).unwrap();
        router.push(routespath.SIGNIN);
      }
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const sideBarContent = useMemo(
    () => [
      {
        label: "Dashboard",
        path: isStandalone ? routespath.SABINOTE_DASHBOARD : routespath.DASHBOARD,
        icon: Home,
        roles: ["admin", "teacher"],
      },
      ...(!isStandalone
        ? [
            {
              label: "Users",
              path: routespath.USERS,
              icon: UserCircle,
              roles: ["admin"],
            },
            {
              label: "Enrollments",
              path: routespath.ENROLLMENTS,
              icon: UserPlus,
              roles: ["admin"],
            },
            {
              label: "Classes",
              path: routespath.CLASSES,
              icon: BookOpenCheck,
              roles: ["admin", "teacher"],
            },
            {
              label: "Subjects",
              path: routespath.SUBJECTS,
              icon: BookOpen,
              roles: ["admin", "teacher"],
            },
            {
              label: "Assessments",
              path: routespath.ASSESSMENTS,
              icon: ClipboardList,
              roles: ["admin", "teacher"],
            },
            {
              label: "Report Cards",
              path: routespath.REPORT,
              icon: BookOpen,
              roles: ["admin", "teacher"],
            },
            {
              label: "Comments",
              path: routespath.COMMENTS,
              icon: MessageSquareText,
              roles: ["admin", "teacher"],
            },
            {
              label: "Attendance",
              path: routespath.ATTENDANCE,
              icon: Calendar,
              roles: ["admin", "teacher"],
            },
            {
              label: "Bulk Upload",
              path: routespath.BULK_UPLOAD,
              icon: DownloadIcon,
              roles: ["admin"],
            },
            {
              label: "Academic",
              path: routespath.ACADEMIC,
              icon: Calendar,
              roles: ["admin"],
            },
            {
              label: "School Settings",
              path: routespath.SCHOOL_SETTINGS,
              icon: Settings,
              roles: ["admin"],
            },
            {
              label: "Branding",
              path: routespath.BRANDING,
              icon: Palette,
              roles: ["admin"],
            },
          ]
        : []),
      {
        label: "Profile",
        path: isStandalone ? routespath.SABINOTE_PROFILE : "/profile",
        icon: User,
        roles: ["admin", "teacher"],
      },
      ...(!isStandalone
        ? [
            {
              label: "Settings",
              path: routespath.SETTINGS,
              icon: Settings,
              roles: ["admin", "teacher"],
            },
          ]
        : []),
    ],
    [isStandalone],
  );

  const filteredContent = useMemo(() => {
    return sideBarContent.filter((item) => {
      if (isStandalone) return true; // Standalone users already have their menu pre-filtered
      if (!item.roles) return true;
      const userRoles = user?.roles || [];
      return item.roles.some((r) => userRoles.includes(r));
    });
  }, [sideBarContent, user?.roles, isStandalone]);

  // Use either standalone user info or regular user info for display
  const effectiveUser = isStandalone
    ? {
        name: standaloneUser?.name || "Teacher",
        role: "Teacher",
        firstName: standaloneUser?.name?.split(" ")[0] || "",
        roles: ["teacher"],
      }
    : user;

  const effectiveTenantInfo = isStandalone
    ? { name: "SabiNote" }
    : tenantInfo;

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <SidebarProvider>
      <SidebarContentContainer
        logo={logo}
        tenantInfo={effectiveTenantInfo}
        user={effectiveUser}
        filteredContent={filteredContent}
        pathname={pathname}
        handleLogout={() => setIsLogoutModalOpen(true)}
        onBrandingClick={() => setIsBrandingModalOpen(true)}
      >
        {children}
      </SidebarContentContainer>
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        loading={isLoggingOut}
      />
      <ComingSoonModal
        open={isBrandingModalOpen}
        onOpenChange={setIsBrandingModalOpen}
        title="Branding & Customization"
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
  handleLogout,
  onBrandingClick,
}: {
  children: ReactNode;
  logo: string;
  tenantInfo: any;
  user: any;
  filteredContent: any[];
  pathname: string;
  handleLogout: () => void;
  onBrandingClick: () => void;
}) => {
  const { open: isExpanded, isMobile } = useSidebar();
  const sidebarContentRef = useRef<HTMLDivElement>(null);

  // Scroll Persistence Logic
  useEffect(() => {
    const sidebar = sidebarContentRef.current;
    if (!sidebar) return;

    // Restore scroll position
    const savedScrollPos = sessionStorage.getItem("sidebar-scroll-pos");
    if (savedScrollPos) {
      // Use requestAnimationFrame to ensure the content is rendered and layout is stable
      requestAnimationFrame(() => {
        sidebar.scrollTop = parseInt(savedScrollPos, 10);
      });
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      sessionStorage.setItem(
        "sidebar-scroll-pos",
        sidebar.scrollTop.toString(),
      );
    };

    sidebar.addEventListener("scroll", handleScroll);
    return () => sidebar.removeEventListener("scroll", handleScroll);
  }, [pathname]); // Re-run when pathname changes to ensure we restore position on new pages

  return (
    <>
      <Sidebar className="border-r border-purple-100/50 bg-white">
        <SidebarHeader className="p-4 sm:p-5 pb-2 relative">
          <div className="absolute top-2 right-2 hidden md:block">
            <SidebarTrigger className="hover:bg-purple-50 h-8 w-8 text-slate-500" />
          </div>
          <div className="flex flex-col items-center text-center gap-1 mt-2">
            <Link
              href={routespath.DASHBOARD}
              prefetch={false}
              className="block shrink-0"
            >
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
                <span className="truncate">
                  {user?.roles?.[0]?.charAt(0).toUpperCase() +
                    user?.roles?.[0]?.slice(1) || "User"}
                  {user?.firstName ? ` • ${user.firstName}` : ""}
                </span>
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent ref={sidebarContentRef} className="px-4">
          <nav className="flex flex-col gap-1.5 mt-4">
            {filteredContent.map((item, index) => {
              const isSelected = pathname === item.path;
              const isBranding = item.path === routespath.BRANDING;

              const content = (
                <div
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group ${
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
                </div>
              );

              return (
                <Link key={index} href={item.path} prefetch={false}>
                  {content}
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
          <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-center z-50 md:hidden">
            <SidebarTrigger className="hover:bg-purple-50 h-9 w-9 sm:h-10 sm:w-10 border border-purple-100 bg-white shadow-sm" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold text-xs border border-red-100 shadow-sm active:scale-95 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        )}
        {!isExpanded && !isMobile && (
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 hidden md:block">
            <SidebarTrigger className="hover:bg-purple-50 h-9 w-9 sm:h-10 sm:w-10" />
          </div>
        )}
        <div className="px-4 py-4 sm:p-6 md:p-10 w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </>
  );
};

export default SideBar;
