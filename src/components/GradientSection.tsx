"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientSectionProps {
  children: ReactNode;
  className?: string;
}

export const GradientSection = ({ children, className }: GradientSectionProps) => {
  return (
    <div 
      className={cn(
        "relative w-full min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800",
        className
      )}
    >
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-100/20 dark:bg-purple-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/20 dark:bg-indigo-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
      </div>
      
      {children}
    </div>
  );
};
