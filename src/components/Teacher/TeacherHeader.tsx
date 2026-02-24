"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";

export function TeacherHeader() {
  const { user } = useSelector((s: RootState) => s.user);

  return (
    <div className="flex flex-row items-center justify-between pl-10 sm:pl-12 md:pl-0 mb-6">
      <p className="text-sm md:text-base">
        Good day{" "}
        <span className="font-semibold text-slate-900">
          {user?.firstName ? user.firstName : "Teacher"}
        </span>
        !
      </p>
      <div className="w-10 h-10 bg-[var(--green-light)] rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
        <span className="text-[10px] font-bold text-emerald-700">LOGO</span>
      </div>
    </div>
  );
}

