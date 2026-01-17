"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  const fullText = "Restore Calm to Your School's Administration";
  return (
    <section className="w-full relative overflow-hidden min-h-screen pt-24 md:pt-32 lg:pt-28 xl:pt-28 2xl:pt-0 pb-2 md:pb-4 lg:pb-6 xl:pb-8 2xl:pb-10">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse opacity-60" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-600/8 rounded-full blur-3xl animate-float-slow opacity-50" />
      
      {/* Two Column Layout: Text Left, Image Right */}
      <div className="flex flex-col lg:flex-row h-full min-h-screen items-start md:items-center justify-start md:justify-center lg:items-center pt-8 md:pt-0 lg:pt-0 relative z-10">
        {/* Left Column: Hero Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start md:justify-center items-start space-y-3 md:space-y-5 lg:space-y-8 xl:space-y-10 py-4 md:py-6 lg:py-0 pb-1 md:pb-2 lg:pb-4 xl:pb-6 2xl:pb-8 px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
          {/* Headline - Mobile: text-[2.75rem], Tablet: text-5xl, Desktop: text-6xl, Large: text-7xl */}
          <h1 className="text-[2.75rem] sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-7xl font-black leading-[1.15] tracking-tight text-left max-w-2xl hero-headline animate-in fade-in slide-in-from-bottom-4 duration-700 break-words text-slate-900 dark:text-white">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
              {/* Mobile and Tablet - Line Break Structure */}
              <span className="block lg:hidden">
                Restore Calm<br />
                to Your<br />
                School's<br />
                Administration
              </span>
              {/* Desktop - Full Text */}
              <span className="hidden lg:inline">
                {fullText}
              </span>
            </span>
          </h1>

          {/* Subheadline - Mobile: text-base, Tablet: text-lg, Desktop: text-xl, Large: text-2xl */}
          <p className="text-base md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-left max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Move from chaotic paper trails and compilation bottlenecks to a unified, digital system. ParaLearn simplifies result management so you can focus on education, not paperwork.
          </p>

          {/* Hero Image - Mobile & Tablet Only (between text and buttons) */}
          <div className="flex items-start justify-start pt-3 md:pt-4 pb-1 md:pb-2 lg:hidden w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="relative w-auto h-auto max-w-[90%] md:max-w-[70%] scale-105 md:scale-75 origin-left group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-indigo-500/20 rounded-xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-50 group-hover:opacity-70 -z-10" />
              <div className="relative">
                <Image
                  src="/herosection.png"
                  alt="Split screen showing stressed administrator with paperwork on left, and clean ParaLearn RMS dashboard on laptop on right"
                  width={600}
                  height={400}
                  className="w-full h-auto object-contain rounded-xl shadow-2xl group-hover:shadow-primary/20 transition-all duration-500 group-hover:scale-[1.02]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Shine effect overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500" />
              </div>
            </div>
          </div>

          {/* CTAs - Consistent sizing within each category */}
          <div className="flex flex-row flex-wrap items-center justify-start gap-3 md:gap-4 lg:gap-6 xl:gap-8 pt-2 md:pt-4 lg:pt-8 pb-1 md:pb-2 lg:pb-4 xl:pb-5 2xl:pb-6 w-full animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Button
              className="font-black shadow-lg shadow-primary/40 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary hover:via-purple-500 hover:to-indigo-500 text-white px-6 py-3 md:px-7 md:py-3.5 lg:px-10 lg:py-4 xl:px-12 xl:py-5 text-sm md:text-base lg:text-lg xl:text-xl font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 whitespace-nowrap flex-shrink-0 h-[42px] md:h-[44px] lg:h-[52px] xl:h-[56px] hover:scale-105 active:scale-100 relative overflow-hidden group/btn"
              onClick={() => {
                window.location.href = "/auth/signup";
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Register Your School
                <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover/btn:opacity-100 group-hover/btn:animate-shimmer transition-opacity duration-500 rounded-xl" />
            </Button>

            <Link
              href="/auth/signin"
              className="text-sm md:text-base lg:text-lg xl:text-xl font-bold text-slate-900 dark:text-white px-7 py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 xl:px-12 xl:py-5 bg-white dark:bg-white/10 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-white/20 dark:hover:to-white/10 rounded-xl border border-slate-200 dark:border-white/20 hover:border-slate-300 dark:hover:border-white/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0 relative overflow-hidden group whitespace-nowrap flex-shrink-0 h-[42px] md:h-[44px] lg:h-[52px] xl:h-[56px] flex items-center justify-center hover:scale-105 active:scale-100"
              onClick={(e) => {
                e.preventDefault();
                const event = new CustomEvent("openLoginModal");
                window.dispatchEvent(event);
              }}
            >
              <span className="relative z-10">Log In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500 rounded-xl" />
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Image - Desktop/Laptop Only */}
        <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-12 xl:p-16 2xl:p-20 animate-in fade-in slide-in-from-right duration-700 delay-200">
          <div className="relative w-full h-full max-w-[90%] xl:max-w-full group">
            {/* Animated gradient background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-500/25 to-indigo-500/30 rounded-2xl blur-3xl group-hover:blur-[40px] transition-all duration-700 opacity-60 group-hover:opacity-80 -z-10 animate-pulse" style={{ animationDuration: '3s' }} />
            
            {/* Floating orbs for depth */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-400/30 dark:bg-purple-600/20 rounded-full blur-2xl animate-float-slow opacity-60" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/25 dark:bg-indigo-600/15 rounded-full blur-2xl animate-float-slower opacity-50" />
            
            {/* Image container with enhanced effects */}
            <div className="relative z-10">
              <Image
                src="/herosection.png"
                alt="Split screen showing stressed administrator with paperwork on left, and clean ParaLearn RMS dashboard on laptop on right"
                width={800}
                height={600}
                className="w-full h-auto object-contain rounded-2xl shadow-2xl group-hover:shadow-primary/30 transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2"
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500 pointer-events-none" />
              
              {/* Border glow effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-primary/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
