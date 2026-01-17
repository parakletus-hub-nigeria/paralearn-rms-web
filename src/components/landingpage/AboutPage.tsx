"use client";

import { ScrollReveal } from "./ScrollReveal";
import { 
  Target, 
  Users, 
  Globe, 
  Award,
  School,
  Clock
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const AboutPage = () => {
  const fullText = "Join Us on This Journey";

  const stats = [
    { icon: School, value: "500+", label: "Schools Trust Us" },
    { icon: Users, value: "50K+", label: "Students Served" },
    { icon: Award, value: "99.9%", label: "Uptime Guarantee" },
    { icon: Globe, value: "15+", label: "Countries Served" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-20 md:py-32 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal animation="reveal" delay="0s">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-600/10 border border-primary/20 dark:border-primary/30">
                <span className="text-xs sm:text-sm font-bold text-primary dark:text-purple-400 uppercase tracking-widest">
                  About ParaLearn
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-6 md:mb-8">
                Empowering Education in{" "}
                <span className="bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl text-slate-600 dark:text-slate-400 font-medium max-w-4xl mx-auto leading-relaxed">
                We're building the future of result management—transforming how schools across Africa handle grades, assessments, and student progress tracking.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/30">
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal animation="reveal" delay="0.1s">
            <div className="text-center mb-12 md:mb-16 lg:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-black text-slate-900 dark:text-white mb-4 md:mb-5 tracking-tight">
                Our Story
              </h2>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-primary rounded-full" />
                <div className="w-1 h-1 rounded-full bg-primary" />
                <div className="w-16 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-indigo-600 rounded-full" />
                <div className="w-1 h-1 rounded-full bg-indigo-600" />
                <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-transparent rounded-full" />
              </div>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <ScrollReveal animation="reveal-left" delay="0.2s">
              <div className="space-y-6">
                <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  ParaLearn was born from a simple observation: schools across Africa were struggling with outdated, manual result management systems that consumed weeks of time and were prone to errors.
                </p>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Our founders, having experienced these challenges firsthand, envisioned a solution that would transform how schools handle grades, assessments, and student progress—making it instant, accurate, and accessible.
                </p>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Today, we're proud to serve hundreds of schools, empowering educators to focus on what matters most: teaching and nurturing the next generation of African leaders.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="reveal-right" delay="0.3s">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-indigo-600/20 rounded-3xl blur-3xl transform rotate-3" />
                <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                          Our Vision
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          To become Africa's leading platform for educational management, empowering every school to achieve excellence.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                          Our Mission
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          To eliminate administrative bottlenecks in education, giving teachers and administrators more time to focus on student success.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24 lg:py-32 relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <ScrollReveal key={index} animation="reveal" delay={`${index * 0.1}s`}>
                  <div className="text-center p-4 md:p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-20 md:py-32 lg:py-40 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-gradient-to-r from-primary/5 via-purple-500/5 to-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <ScrollReveal animation="reveal" delay="0s">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-6 md:mb-8">
              {fullText}
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-lg text-slate-600 dark:text-slate-400 font-medium mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
              Ready to transform your school's result management? Let's build the future of education together.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Link href="/auth/signup">
                <Button 
                  size="lg"
                  className="h-12 sm:h-14 md:h-14 px-6 sm:px-8 md:px-10 rounded-2xl text-sm sm:text-base md:text-base font-black shadow-2xl shadow-primary/50 transition-all duration-300 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 relative overflow-hidden group w-full sm:w-auto touch-manipulation active:scale-95"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started Today
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
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
