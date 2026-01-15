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
    <div className={`relative min-h-screen bg-gradient-to-br from-[#F8F4FF] via-[#F0E5FF] to-[#E8D5FF] dark:from-[#0A0518] dark:via-[#0F0A1F] dark:to-[#140D24] overflow-hidden ${className}`}>
      {/* Enhanced Grid Pattern with gradient overlay */}
      <div className="fixed inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent)] pointer-events-none opacity-40 dark:opacity-20" />
      
      {/* Animated gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 pointer-events-none animate-pulse" />

      {/* Enhanced Dynamic Background Elements with better gradients */}
      <div className="fixed top-[-15%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-purple-400/25 via-primary/20 to-transparent dark:from-purple-600/15 dark:via-primary/10 rounded-full blur-[180px] pointer-events-none animate-float-slow" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[70%] h-[70%] bg-gradient-to-tl from-indigo-400/20 via-purple-500/15 to-transparent dark:from-indigo-600/12 dark:via-purple-600/8 rounded-full blur-[180px] pointer-events-none animate-float-slower" />
      <div className="fixed top-[20%] right-[15%] w-[40%] h-[40%] bg-gradient-to-br from-fuchsia-400/15 via-purple-400/10 to-transparent dark:from-fuchsia-600/8 dark:via-purple-600/5 rounded-full blur-[160px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      
      {/* Extra floating orbs with enhanced gradients */}
      <div className="fixed top-[60%] left-[10%] w-40 h-40 bg-gradient-to-br from-primary/25 via-purple-500/20 to-transparent rounded-full blur-3xl animate-float-slow opacity-80" style={{ animationDelay: '3s' }} />
      <div className="fixed bottom-[20%] left-[40%] w-56 h-56 bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl animate-float-slower opacity-70" style={{ animationDuration: '20s' }} />
      <div className="fixed top-[40%] right-[30%] w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl animate-float-slow opacity-60" style={{ animationDelay: '6s', animationDuration: '12s' }} />

      {/* Subtle animated lines for depth */}
      <div className="fixed top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent pointer-events-none" />
      <div className="fixed top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/10 to-transparent pointer-events-none" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};



