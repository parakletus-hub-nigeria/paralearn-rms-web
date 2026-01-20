"use client";

import Header from "@/components/landingpage/Header";
import { GradientSection } from "@/components/GradientSection";
import Footer from "@/components/landingpage/Footer";

export default function Documentation() {
  return (
    <GradientSection className="min-h-screen">
      <Header />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Documentation
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Learn how to get the most out of ParaLearn.
            </p>
          </div>
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Documentation</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Comprehensive guides and API documentation for ParaLearn.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Our documentation is currently being prepared. For immediate assistance, please visit our Help Center or contact support.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </GradientSection>
  );
}
