"use client";

import { LandingLayout } from "../LandingLayout";

export default function PricingPage() {
  return (
    <LandingLayout className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Pricing
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Simple, transparent pricing that scales with your school.
          </p>
        </div>
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Coming Soon</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Our pricing plans are being finalized. Contact us for a custom quote tailored to your school&apos;s needs.
            </p>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
