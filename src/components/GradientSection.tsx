"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientSectionProps {
  children: ReactNode;
  className?: string;
}

export const GradientSection = ({ children, className }: GradientSectionProps) => {
  return (
    <div className={`relative min-h-screen bg-slate-100  overflow-hidden ${className}`}>
      {/* Enhanced Grid Pattern with gradient overlay */}
      <div className="fixed inset-0 bg-grid-slate-300/50  [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent)] pointer-events-none opacity-50 " />
      
      {/* Animated gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-200/60 via-transparent to-slate-200/70   pointer-events-none animate-pulse" />

      {/* Enhanced Dynamic Background Elements with better gradients */}
      <div className="fixed top-[-15%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-slate-300/40 via-slate-200/30 to-transparent   rounded-full blur-[180px] pointer-events-none animate-float-slow" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[70%] h-[70%] bg-gradient-to-tl from-slate-300/40 via-slate-200/30 to-transparent   rounded-full blur-[180px] pointer-events-none animate-float-slower" />
      <div className="fixed top-[20%] right-[15%] w-[40%] h-[40%] bg-gradient-to-br from-slate-300/30 via-slate-200/20 to-transparent   rounded-full blur-[160px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      
      {/* Extra floating orbs with enhanced gradients */}
      <div className="fixed top-[60%] left-[10%] w-40 h-40 bg-gradient-to-br from-slate-400/30 via-slate-300/20 to-transparent rounded-full blur-3xl animate-float-slow opacity-80" style={{ animationDelay: '3s' }} />
      <div className="fixed bottom-[20%] left-[40%] w-56 h-56 bg-gradient-to-tr from-slate-400/20 via-slate-300/10 to-transparent rounded-full blur-3xl animate-float-slower opacity-70" style={{ animationDuration: '20s' }} />
      <div className="fixed top-[40%] right-[30%] w-32 h-32 bg-gradient-to-bl from-slate-400/25 to-transparent rounded-full blur-2xl animate-float-slow opacity-60" style={{ animationDelay: '6s', animationDuration: '12s' }} />

      {/* Subtle animated lines for depth */}
      <div className="fixed top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-slate-300 to-transparent  pointer-events-none" />
      <div className="fixed top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-slate-300 to-transparent  pointer-events-none" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
