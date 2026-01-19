"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  const fullText = "Restore Calm to Your School's Administration";
  return (
    <section className="w-full relative overflow-hidden min-h-screen pt-24 md:pt-32 lg:pt-28 xl:pt-28 2xl:pt-0 pb-2 md:pb-4 lg:pb-6 xl:pb-8 2xl:pb-10" style={{ transform: 'translateZ(0)' }}>
      
      {/* Two Column Layout: Text Left, Image Right */}
      <div className="flex flex-col lg:flex-row h-full min-h-screen items-start md:items-center justify-start md:justify-center lg:items-center pt-8 md:pt-0 lg:pt-0 relative z-10">
        {/* Left Column: Hero Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start md:justify-center items-start space-y-3 md:space-y-5 lg:space-y-8 xl:space-y-10 py-4 md:py-6 lg:py-0 pb-1 md:pb-2 lg:pb-4 xl:pb-6 2xl:pb-8 px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
          {/* Headline - Mobile: text-[2.75rem], Tablet: text-5xl, Desktop: text-6xl, Large: text-7xl */}
          <h1 className="text-[2.75rem] sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-7xl font-black leading-[1.15] tracking-tight text-left max-w-2xl hero-headline break-words text-slate-900 dark:text-white">
            <span className="bg-gradient-to-r from-primary via-purple-600 to-indigo-600 dark:from-purple-400 dark:via-indigo-400 dark:to-primary bg-clip-text text-transparent">
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
          <p className="text-base md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-left max-w-xl">
            Move from chaotic paper trails and compilation bottlenecks to a unified, digital system. ParaLearn simplifies result management so you can focus on education, not paperwork.
          </p>
          
          {/* Hero Image - Mobile & Tablet Only (between text and buttons) */}
          <div className="flex items-start justify-start pt-3 md:pt-4 pb-1 md:pb-2 lg:hidden w-full">
            <div className="relative w-auto h-auto max-w-[90%] md:max-w-[70%] scale-105 md:scale-75 origin-left">
              <div className="relative">
                <Image
                  src="/herosection.png"
                  alt="Split screen showing stressed administrator with paperwork on left, and clean ParaLearn RMS dashboard on laptop on right"
                  width={600}
                  height={400}
                  className="w-full h-auto object-contain rounded-xl shadow-md"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
          
          {/* CTAs - Consistent sizing within each category */}
          <div className="flex flex-row flex-wrap items-center justify-start gap-3 md:gap-4 lg:gap-6 xl:gap-8 pt-2 md:pt-4 lg:pt-8 pb-1 md:pb-2 lg:pb-4 xl:pb-5 2xl:pb-6 w-full">
            <Button
              className="font-black bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-indigo-600 hover:to-primary text-white px-6 py-3 md:px-7 md:py-3.5 lg:px-10 lg:py-4 xl:px-12 xl:py-5 text-sm md:text-base lg:text-lg xl:text-xl font-semibold rounded-xl shadow-md shadow-primary/30 whitespace-nowrap flex-shrink-0 h-[42px] md:h-[44px] lg:h-[52px] xl:h-[56px]"
              onClick={() => {
                window.location.href = "/auth/signup";
              }}
            >
              <span className="flex items-center gap-2">
                Register Your School
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>
            
            <Link
              href="/auth/signin"
              className="text-sm md:text-base lg:text-lg xl:text-xl font-bold text-slate-900 dark:text-white px-7 py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 xl:px-12 xl:py-5 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 rounded-xl border border-slate-200 dark:border-white/20 shadow-md whitespace-nowrap flex-shrink-0 h-[42px] md:h-[44px] lg:h-[52px] xl:h-[56px] flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                const event = new CustomEvent('openLoginModal');
                window.dispatchEvent(event);
              }}
            >
              Log In
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Image - Desktop/Laptop Only */}
        <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-12 xl:p-16 2xl:p-20">
          <div className="relative w-full h-full max-w-[90%] xl:max-w-full">
            <div className="relative">
              <Image
                src="/herosection.png"
                alt="Split screen showing stressed administrator with paperwork on left, and clean ParaLearn RMS dashboard on laptop on right"
                width={800}
                height={600}
                className="w-full h-auto object-contain rounded-2xl shadow-md"
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
