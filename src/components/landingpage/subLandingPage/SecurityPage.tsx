"use client";

import { LandingLayout } from "../LandingLayout";

export default function SecurityPage() {
  return (
    <LandingLayout className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Security
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Your data security is our top priority.
          </p>
        </div>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md space-y-6">
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Data Encryption</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                All data transmitted between your devices and our servers is encrypted using industry-standard SSL/TLS encryption protocols.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Secure Storage</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Your data is stored in secure, encrypted databases with regular backups and redundancy measures to ensure data integrity and availability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Access Controls</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We implement role-based access controls, ensuring that only authorized personnel can access sensitive student and academic information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Regular Security Audits</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We conduct regular security audits and penetration testing to identify and address potential vulnerabilities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Report Security Issues</h2>
              <p className="text-slate-600 dark:text-slate-400">
                If you discover a security vulnerability, please report it to us at{" "}
                <a href="mailto:security@paralearn.com" className="text-primary hover:underline">security@paralearn.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
