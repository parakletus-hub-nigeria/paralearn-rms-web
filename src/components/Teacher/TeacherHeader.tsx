"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";

export function TeacherHeader() {
  const { user } = useSelector((s: RootState) => s.user);

  return (
    <div className="flex flex-row items-center justify-between pl-10 sm:pl-12 md:pl-0 mb-6">
      <p className="text-sm md:text-base">
        Good day{" "}
        <span className="font-semibold" style={{ color: "var(--foreground)" }}>
          {user?.firstName ? user.firstName : "Teacher"}
        </span>
        !
      </p>
      <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm" style={{ border: "1px solid var(--border-fine)" }}>
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'teacher'}`}
          alt="Teacher Avatar"
          className="w-full h-full object-cover"
          style={{ background: "var(--surface-muted)" }}
        />
      </div>
    </div>
  );
}

