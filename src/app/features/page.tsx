"use client";

import Header from "@/components/landingpage/Header";
import { GradientSection } from "@/components/GradientSection";
import Footer from "@/components/landingpage/Footer";

export default function Features() {
  return (
    <GradientSection className="min-h-screen">
      <Header />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Features
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Discover what makes ParaLearn the perfect solution for your school's result management needs.
            </p>
          </div>
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Coming Soon</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Our features page is under development. Check back soon for detailed information about all our capabilities.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </GradientSection>
  );
}
