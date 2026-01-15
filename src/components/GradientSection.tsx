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
    <div className={`relative min-h-screen bg-[#F8F4FF] dark:bg-[#0A0518] overflow-hidden ${className}`}>
      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] pointer-events-none" />

      {/* Dynamic Background Elements */}
      <div className="fixed top-[-15%] left-[-10%] w-[70%] h-[70%] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[160px] pointer-events-none animate-float-slow" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[70%] h-[70%] bg-indigo-400/15 dark:bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none animate-float-slower" />
      <div className="fixed top-[20%] right-[15%] w-[40%] h-[40%] bg-fuchsia-400/10 dark:bg-fuchsia-600/5 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      
      {/* Extra floating orbs for depth */}
      <div className="fixed top-[60%] left-[10%] w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '3s' }} />
      <div className="fixed bottom-[20%] left-[40%] w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-float-slower" style={{ animationDuration: '20s' }} />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};



