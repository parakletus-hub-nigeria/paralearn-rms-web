"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const fullText = "Ready to modernize your school's result management?";
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-20 md:py-32 lg:py-40 overflow-hidden relative bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/30">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl font-black leading-tight text-slate-900 dark:text-white mb-6 md:mb-8 tracking-tight">
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
        
        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl lg:text-xl text-slate-600 dark:text-slate-400 font-medium mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed">
          Whether you're starting fresh or migrating from a manual system - Result Management,
          Assessment Tracking, Grade Compilation, and Student Progress Reporting, we support
          your school's growth.
        </p>
        
        {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            <Button 
              size="lg"
              onClick={() => {
                window.location.href = "/auth/signup";
              }}
              className="h-12 sm:h-14 px-8 sm:px-10 rounded-2xl text-base sm:text-lg font-black bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:via-purple-500/90 hover:to-indigo-500/90 text-white border-0 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 w-full sm:w-auto group touch-manipulation active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                Start Registration
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-active:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
            <Button
              size="lg"
              onClick={() => {
                window.location.href = "/about";
              }}
              variant="ghost"
              className="h-12 sm:h-14 px-8 sm:px-10 rounded-2xl text-base sm:text-lg font-bold text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-purple-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-purple-400 transition-all duration-300 w-full sm:w-auto touch-manipulation active:scale-95"
            >
              Learn More
            </Button>
          </div>
      </div>
    </section>
  );
};

export default CTASection;
