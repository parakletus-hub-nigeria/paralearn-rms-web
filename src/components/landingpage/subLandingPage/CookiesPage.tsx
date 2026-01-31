"use client";

import { LandingLayout } from "../LandingLayout";

export default function CookiesPage() {
  return (
    <LandingLayout className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md space-y-6">
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">What Are Cookies</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">How We Use Cookies</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                ParaLearn uses cookies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4 ml-4">
                <li>Keep you signed in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our services</li>
                <li>Improve and optimize our website performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Types of Cookies We Use</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device until they expire or are deleted).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Managing Cookies</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You can control and manage cookies through your browser settings. Please note that disabling cookies may affect the functionality of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Contact Us</h2>
              <p className="text-slate-600 dark:text-slate-400">
                If you have any questions about our use of cookies, please contact us at{" "}
                <a href="mailto:privacy@paralearn.com" className="text-primary hover:underline">privacy@paralearn.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
