"use client";

import { ScrollReveal } from "./ScrollReveal";

const ComparisonSection = () => {
  return (
    <section 
      className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24 lg:py-12 relative overflow-hidden bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/30"
      style={{ transform: 'translateZ(0)' }}
    >

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <ScrollReveal animation="reveal" delay="0s">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-600/10 border border-primary/20 dark:border-primary/30">
              <span className="text-xs sm:text-sm font-bold text-primary dark:text-purple-400 uppercase tracking-widest">
                The Transformation
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl font-black text-slate-900 dark:text-white mb-4 md:mb-5 tracking-tight">
              The Shift
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium">
              The Old Way vs. The ParaLearn Way
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* The Reality You Know */}
          <ScrollReveal animation="reveal-left" delay="0.1s">
          <div>
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-8 shadow-md border-2 border-red-200 dark:border-red-900/30 group relative overflow-hidden touch-manipulation">
              {/* Gradient border on hover/active */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-400 via-orange-500 to-red-500 opacity-0 group-hover:opacity-10 group-active:opacity-10 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-shrink-0">
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 via-orange-600 to-red-600 dark:from-red-600 dark:via-orange-700 dark:to-red-700 flex items-center justify-center text-4xl shadow-lg shadow-red-500/30">
                      😓
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white transition-colors duration-500 group-hover:text-red-600 group-active:text-red-600 dark:group-hover:text-red-400 dark:group-active:text-red-400">
                    The Reality You Know
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                      Weeks of Compilation
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Teachers rushing to calculate scores manually while you wait for the master broadsheet.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                      Error-Prone Records
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Missing scripts, calculation errors, and grade disputes that damage parent trust.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                      Compromised Exams
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Dealing with malpractice and students sharing answers during assessments.
                    </p>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-700/60 transition-colors duration-500 relative group-hover:border-transparent group-active:border-transparent">
                  <div className="absolute top-0 left-0 h-0.5 w-0 bg-gradient-to-r from-red-400 via-orange-500 to-red-500 transition-all duration-500 rounded-full group-hover:w-full group-active:w-full" />
                </div>
              </div>
            </div>
          </div>
          </ScrollReveal>

          {/* The ParaLearn Standard */}
          <ScrollReveal animation="reveal-right" delay="0.1s">
          <div>
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-8 shadow-md border-2 border-primary/30 dark:border-primary/50 group relative overflow-hidden touch-manipulation">
              {/* Gradient border on hover/active */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-10 group-active:opacity-10 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-shrink-0">
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-purple-700 to-indigo-700 dark:from-primary/90 dark:via-purple-600/90 dark:to-indigo-600/90 flex items-center justify-center text-4xl shadow-lg shadow-primary/30">
                      ✨
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white transition-colors duration-500 group-hover:text-primary group-active:text-primary dark:group-hover:text-purple-400 dark:group-active:text-purple-400">
                    The ParaLearn Standard
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                      Instant Compilation
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Scores move from teacher phones to the master broadsheet in real-time.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                      Verified Accuracy
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Automated calculations eliminate human error. What is recorded is exactly what is reported.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                      Integrity First
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Secure Computer-Based Testing (CBT) ensures the grades students get are the grades they earned.
                    </p>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-700/60 transition-colors duration-500 relative group-hover:border-transparent group-active:border-transparent">
                  <div className="absolute top-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary via-purple-500 to-indigo-600 transition-all duration-500 rounded-full group-hover:w-full group-active:w-full" />
                </div>
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
