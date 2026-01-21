"use client";

import {
  Shield,
  Sparkles,
  Eye,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingLayout } from "../LandingLayout";

const AboutPage = () => {
  const coreValues = [
    {
      icon: Shield,
      title: "Integrity",
      description: "We believe a grade is a currency of trust. Our system ensures it is never devalued by error or malpractice."
    },
    {
      icon: Sparkles,
      title: "Simplicity",
      description: "Complexity is the enemy of execution. If it requires a manual to use, we refine it until it doesn't."
    },
    {
      icon: Eye,
      title: "Transparency",
      description: "Parents deserve to know; students deserve to see. We bridge the communication gap instantly."
    }
  ];

  return (
    <LandingLayout className="min-h-screen">
      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 md:py-16 lg:py-20 relative overflow-hidden bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/30">
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 pt-4 md:pt-6">
          <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-black text-slate-900 dark:text-white mb-3 md:mb-4 tracking-tight">
                Goal
              </h2>
            </div>

          <div className="max-w-4xl mx-auto space-y-8 md:space-y-10">
            <div className="space-y-4">
                <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Establish trust by showing you understand the unique challenges of African educational administration.
                </p>
              </div>

            <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-black text-slate-900 dark:text-white mb-3">
                  We Believe Education Should Be About Teaching, Not Tallying.
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  ParaLearn was built to bridge the gap between the administrative efficiency schools need and the educational excellence they strive for.
                </p>
              </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 md:py-16 lg:py-20 relative overflow-hidden bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/30">
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-black text-slate-900 dark:text-white mb-3 md:mb-4 tracking-tight">
                Our Story
              </h2>
            </div>

          <div className="max-w-4xl mx-auto space-y-8 md:space-y-10">
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">
                The Problem We Saw
              </h3>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Across Africa, we noticed a recurring pattern in top-tier schools. Principals were visionary leaders, and teachers were passionate educators, yet both were constantly bogged down by the "end-of-term chaos." The manual compilation of broadsheets, the endless verification of scores, and the stress of deadline-driven grading were stealing valuable time from what matters most: the students.
              </p>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">
                  The Solution We Built
                </h3>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  We didn't just build a database; we built an operating system for academic integrity. ParaLearn RMS exists to automate the repetitive, high-stakes tasks of school management. By handling the heavy lifting of calculation and data security, we return peace of mind to the administrator's office and weekends to the staff room.
                </p>
              </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 md:py-16 lg:py-20 relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-black text-slate-900 dark:text-white mb-3 md:mb-4 tracking-tight">
                Our Core Values
              </h2>
            </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-indigo-600/10 rounded-3xl blur-xl transform rotate-3" />
                    <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="w-12 h-12 md:w-14 md:h-14 mb-3 md:mb-4 rounded-full bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center">
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 md:mb-3">
                        {value.title}
                      </h3>
                      <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {value.description}
                      </p>
                    </div>
                  </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-gradient-to-r from-primary/5 via-purple-500/5 to-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-6 md:mb-8">
              Join the movement towards efficient education.
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="h-12 sm:h-14 md:h-14 px-6 sm:px-8 md:px-10 rounded-2xl text-sm sm:text-base md:text-base font-black shadow-2xl shadow-primary/50 transition-all duration-300 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 relative overflow-hidden group w-full sm:w-auto touch-manipulation active:scale-95"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Your School's Registration
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-active:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 sm:h-14 md:h-14 px-5 sm:px-6 md:px-8 text-sm sm:text-base md:text-base font-bold border border-slate-200 dark:border-slate-700 transition-all duration-300 w-full sm:w-auto"
                >
                  Return to Home
                </Button>
              </Link>
            </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default AboutPage;
