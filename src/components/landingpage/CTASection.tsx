"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const CTASection = () => {
  const fullText = "Ready to modernize your school result management?";
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-20 md:py-32 lg:py-16 overflow-hidden relative bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/30" style={{ transform: 'translateZ(0)' }}>
      
      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {/* Headline */}
        <ScrollReveal animation="reveal" delay="0s">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl font-black leading-tight bg-gradient-to-r from-slate-900 via-primary to-indigo-700 dark:from-white dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6 md:mb-8 tracking-tight">
          <span>
            {fullText.includes("your ") ? (
              <>
                {fullText.substring(0, fullText.indexOf("your ") + 5)}
                <br className="hidden sm:block" />
                {fullText.substring(fullText.indexOf("your ") + 5)}
              </>
            ) : (
              fullText
            )}
          </span>
        </h1>
        </ScrollReveal>
        
        {/* Subheadline */}
        <ScrollReveal animation="reveal" delay="0.08s">
        <p className="text-base sm:text-lg md:text-xl lg:text-xl text-slate-600 dark:text-slate-400 font-medium mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed">
          Whether you are starting fresh or migrating from a manual system - Result Management,
          Assessment Tracking, Grade Compilation, and Student Progress Reporting, we support
          your school growth.
        </p>
        </ScrollReveal>
        
        {/* CTA Buttons */}
        <ScrollReveal animation="reveal" delay="0.16s">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            <Link href="/auth/signup">
              <Button 
                size="lg"
                className="h-12 sm:h-14 px-8 sm:px-10 rounded-2xl text-base sm:text-lg font-black bg-gradient-to-r from-primary via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-indigo-700 hover:to-primary text-white border-0 shadow-md shadow-primary/30 w-full sm:w-auto touch-manipulation"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Registration
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-active:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="ghost"
                className="h-12 sm:h-14 px-8 sm:px-10 rounded-2xl text-base sm:text-lg font-bold text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-purple-500 hover:bg-gradient-to-r hover:from-primary/10 hover:via-purple-600/10 hover:to-indigo-700/10 dark:hover:from-purple-500/10 dark:hover:via-indigo-500/10 dark:hover:to-primary/10 hover:text-primary dark:hover:text-purple-400 transition-all duration-300 w-full sm:w-auto touch-manipulation active:scale-95"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTASection;
