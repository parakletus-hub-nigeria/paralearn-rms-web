"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/reduxToolKit/store";
import { logoutUser } from "@/reduxToolKit/user/userThunks";
import { Button } from "@/components/ui/button";
import { LogOut, User, Bell, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StudentHeaderProps {
  transparent?: boolean;
}

export function StudentHeader({ transparent = false }: StudentHeaderProps) {
  const { user } = useSelector((s: RootState) => s.user);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/auth/signin");
  };

  const textColorClass = transparent ? "text-white" : "text-slate-900";
  const subTextColorClass = transparent ? "text-indigo-200" : "text-slate-400";
  const iconColorClass = transparent ? "text-indigo-200 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50";
  const navLinkColorClass = transparent ? "text-indigo-100 hover:text-white" : "text-slate-600 hover:text-indigo-600";

  return (
    <div className={`${transparent ? "bg-transparent border-white/10" : "bg-white border-slate-100"} border-b h-20 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 transition-all duration-300`}>
      <div className="flex items-center gap-8">
        <Link href="/student/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110 shadow-lg shadow-indigo-500/30">PL</div>
          <div className="flex flex-col leading-none">
            <span className={`font-bold text-lg tracking-tight ${textColorClass}`}>ParaLearn</span>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Premium CBT</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/student/dashboard" className={`px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all ${transparent ? "bg-white/10 text-white shadow-inner border border-white/5" : "bg-indigo-50 text-indigo-700"}`}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/student/results" className={`px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all relative group cursor-not-allowed ${transparent ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-50"}`}>
            <Bell className="w-4 h-4 group-hover:text-indigo-300 transition-colors" />
            Results
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-5">
        <div className="text-right hidden sm:block">
          <p className={`text-sm font-semibold ${textColorClass}`}>{user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Student"}</p>
          <p className={`text-[10px] uppercase tracking-wider font-medium ${subTextColorClass}`}>Student Portal</p>
        </div>
        
        <div className="relative group">
           <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 opacity-75 blur-sm group-hover:opacity-100 transition-opacity"></div>
           <button className="relative w-11 h-11 rounded-full border-2 border-slate-900 p-[2px] bg-slate-900 overflow-hidden">
             <img alt="Avatar" className="rounded-full w-full h-full object-cover" src="/avatar-placeholder.png" />
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
           </button>
           
           {/* Dropdown Menu (Simplified) */}
           <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
