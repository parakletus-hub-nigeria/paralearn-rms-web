"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const fullText = "Restore Calm to Your School's Administration";
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentIndex < fullText.length && isTyping) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + fullText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 80); // Adjust speed here (lower = faster)

      return () => clearTimeout(timeout);
    } else if (currentIndex >= fullText.length) {
      setIsTyping(false);
    }
  }, [currentIndex, isTyping, fullText]);
  return (
    <section className="w-full relative overflow-hidden min-h-screen pt-24 md:pt-32 lg:pt-28 xl:pt-28 2xl:pt-0">
      {/* Two Column Layout: Text Left, Image Right */}
      <div className="flex flex-col lg:flex-row h-full min-h-screen items-start md:items-center justify-start md:justify-center lg:items-center pt-8 md:pt-0 lg:pt-0">
        {/* Left Column: Hero Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start md:justify-center items-center lg:items-start space-y-3 md:space-y-5 lg:space-y-8 xl:space-y-10 py-4 md:py-6 lg:py-0 px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
          {/* Headline - Mobile: text-5xl, Tablet: text-5xl, Desktop: text-6xl, Large: text-7xl */}
          <h1 className="text-5xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-7xl font-black leading-[1.15] tracking-tight text-center lg:text-left max-w-2xl hero-headline">
            <span>{displayText}</span>
            {isTyping && (
              <span className="inline-block w-0.5 h-[0.9em] bg-slate-900 dark:bg-white ml-1 align-baseline animate-blink" />
            )}
          </h1>
          
          {/* Subheadline - Mobile: text-base, Tablet: text-lg, Desktop: text-xl, Large: text-2xl */}
          <p className="text-base md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-center lg:text-left max-w-xl">
            Move from chaotic paper trails and compilation bottlenecks to a unified, digital system. ParaLearn simplifies result management so you can focus on education, not paperwork.
          </p>
          
          {/* Hero Image - Mobile & Tablet Only (between text and buttons) */}
          <div className="flex items-center justify-center py-3 md:py-5 lg:hidden w-full -mx-6 md:mx-0">
            <div className="relative w-full h-auto max-w-full scale-105 md:scale-100">
              <Image
                src="/herosection.png"
                alt="Split screen showing stressed administrator with paperwork on left, and clean ParaLearn RMS dashboard on laptop on right"
                width={600}
                height={400}
                className="w-full h-auto object-contain rounded-xl shadow-2xl"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
          
          {/* CTAs - Consistent sizing within each category */}
          <div className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 lg:gap-6 xl:gap-8 pt-2 md:pt-5 lg:pt-8 w-full">
            <Button
              className="font-black shadow-lg shadow-primary/40 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:via-purple-500/90 hover:to-indigo-500/90 hover:bg-orange-600 text-white px-6 py-3 md:px-7 md:py-3.5 lg:px-10 lg:py-4 xl:px-12 xl:py-5 text-sm md:text-base lg:text-lg xl:text-xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all whitespace-nowrap flex-shrink-0 h-[42px] md:h-[44px] lg:h-[52px] xl:h-[56px]"
              onClick={() => {
                window.location.href = "/auth/signup";
              }}
            >
              Register Your School
            </Button>
            
            <Link
              href="/auth/signin"
              className="text-sm md:text-base lg:text-lg xl:text-xl font-bold text-slate-900 dark:text-white px-7 py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 xl:px-12 xl:py-5 bg-white dark:bg-white/10 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-white/20 dark:hover:to-white/10 rounded-xl border border-slate-200 dark:border-white/20 hover:border-slate-300 dark:hover:border-white/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group whitespace-nowrap flex-shrink-0 h-[42px] md:h-[44px] lg:h-[52px] xl:h-[56px] flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                const event = new CustomEvent('openLoginModal');
                window.dispatchEvent(event);
              }}
            >
              <span className="relative z-10">Log In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Image - Desktop/Laptop Only */}
        <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-12 xl:p-16 2xl:p-20">
          <div className="relative w-full h-full max-w-[90%] xl:max-w-full">
            <Image
              src="/herosection.png"
              alt="Split screen showing stressed administrator with paperwork on left, and clean ParaLearn RMS dashboard on laptop on right"
              width={800}
              height={600}
              className="w-full h-auto object-contain rounded-lg"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
