"use client";

import { LandingLayout } from "../LandingLayout";

export default function TermsPage() {
  return (
    <LandingLayout className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md space-y-6">
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                By accessing and using ParaLearn, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">2. Use License</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Permission is granted to temporarily use ParaLearn for your school&apos;s result management purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose without our written consent</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or other proprietary notations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">3. User Responsibilities</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">4. Limitation of Liability</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                In no event shall ParaLearn or its suppliers be liable for any damages arising out of the use or inability to use the services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">5. Contact Us</h2>
              <p className="text-slate-600 dark:text-slate-400">
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:legal@paralearn.com" className="text-primary hover:underline">legal@paralearn.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
