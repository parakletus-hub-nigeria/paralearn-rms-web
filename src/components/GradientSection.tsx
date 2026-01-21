"use client";

import React from "react";

interface GradientSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientSection = ({
  children,
  className = "",
}: GradientSectionProps) => {
  return (
    <div className={`relative min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-x-hidden ${className}`}>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};



