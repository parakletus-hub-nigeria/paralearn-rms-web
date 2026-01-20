"use client";

import Header from "@/components/landingpage/Header";
import { GradientSection } from "@/components/GradientSection";
import Footer from "@/components/landingpage/Footer";

export default function Privacy() {
  return (
    <GradientSection className="min-h-screen">
      <Header />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md space-y-6">
              <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">1. Introduction</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  ParaLearn ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our result management system.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">2. Information We Collect</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  We collect information that you provide directly to us, including school information, administrator details, student data, and academic records necessary for the operation of our result management system.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">3. How We Use Your Information</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you about your account and our services.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">4. Data Security</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">5. Contact Us</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  If you have any questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:privacy@paralearn.com" className="text-primary hover:underline">privacy@paralearn.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </GradientSection>
  );
}
