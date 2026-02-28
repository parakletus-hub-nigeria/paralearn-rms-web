"use client";

import { LandingLayout } from "../LandingLayout";

export default function HelpPage() {
  return (
    <LandingLayout className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Help Center
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Find answers to common questions and get help when you need it.
          </p>
        </div>
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Need Help?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Our help center is currently being developed. In the meantime, you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
              <li>Contact our support team via WhatsApp</li>
              <li>Email us at <a href="mailto:support@paralearn.com" className="text-primary hover:underline">support@paralearn.com</a></li>
              <li>Check our documentation for technical guides</li>
            </ul>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
