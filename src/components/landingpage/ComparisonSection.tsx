"use client";

const ComparisonSection = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-32 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            The Shift: The Old Way vs. The ParaLearn Way
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* The Reality You Know */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border-2 border-red-200 dark:border-red-900/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-2xl">😓</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
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
          </div>

          {/* The ParaLearn Standard */}
          <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-indigo-500/10 dark:from-primary/20 dark:via-purple-500/20 dark:to-indigo-500/20 rounded-2xl p-8 shadow-lg border-2 border-primary/30 dark:border-primary/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                The ParaLearn Standard
              </h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                  Instant Compilation
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Scores move from the teacher's phone to the master broadsheet in real-time.
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
