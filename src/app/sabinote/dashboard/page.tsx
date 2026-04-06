"use client";

import SabiNoteStandaloneGuard from "@/components/sabinote/SabiNoteStandaloneGuard";
import { LessonGeneratorDashboard } from "@/components/RMS/LessonGenerator/LessonGeneratorDashboard";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { standaloneLogout } from "@/reduxToolKit/sabiStandaloneAuth/sabiStandaloneAuthThunks";
import { useRouter } from "next/navigation";
import { routespath } from "@/lib/routepath";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

function StandaloneDashboardInner() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((s: RootState) => s.sabiStandaloneAuth);

  const handleLogout = async () => {
    await dispatch(standaloneLogout());
    router.push(routespath.SABINOTE_LOGIN);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/30">
      {/* Minimal standalone header */}
      <header className="bg-white border-b border-slate-100 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            SabiNote
          </span>
          <div className="flex items-center gap-4">
            {user?.name && (
              <span className="text-sm font-bold text-slate-600 hidden sm:block">
                Hi, {user.name.split(" ")[0]}
              </span>
            )}
            <Link
              href={routespath.SABINOTE_PROFILE}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-purple-600 transition-colors"
            >
              <User className="w-4 h-4" /> Profile & Wallet
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <LessonGeneratorDashboard />
      </main>
    </div>
  );
}

export default function SabiNoteDashboardPage() {
  return (
    <SabiNoteStandaloneGuard>
      <StandaloneDashboardInner />
    </SabiNoteStandaloneGuard>
  );
}
