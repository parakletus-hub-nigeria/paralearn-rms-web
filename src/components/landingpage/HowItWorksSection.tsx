"use client";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "Create Your Workspace",
      description: "Register your institution and define your structure (Classes, Subjects, and Grading Systems).",
      icon: "🏢",
    },
    {
      number: "2",
      title: "Claim Your Identity",
      description: "Get a dedicated, secure subdomain for your school (e.g., yourschool.pl.ng).",
      icon: "🔐",
    },
    {
      number: "3",
      title: "Onboard Your Team",
      description: "Invite teachers and upload student lists. They receive credentials instantly.",
      icon: "👥",
    },
  ];

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/80 to-slate-100/50 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-800/50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-600/10 border border-primary/20 dark:border-primary/30">
            <span className="text-xs sm:text-sm font-bold text-primary dark:text-purple-400 uppercase tracking-widest">
              Simple Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 dark:text-white mb-4 md:mb-5 tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-primary to-primary rounded-full" />
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary via-purple-500 to-indigo-600" />
            <div className="w-24 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-indigo-600 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary via-purple-500 to-indigo-600" />
            <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-transparent rounded-full" />
          </div>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connecting Lines with Animated Dots - Desktop Only */}
          <div className="hidden lg:block absolute top-[100px] left-[8%] right-[8%] h-1 z-0">
            <div className="w-full h-full bg-gradient-to-r from-primary/30 via-purple-500/50 to-indigo-600/30 rounded-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-indigo-600 rounded-full opacity-60 animate-pulse" />
              {/* Animated dots */}
              <div className="absolute left-[16.66%] top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50 animate-ping" style={{ animationDelay: '0s' }} />
              <div className="absolute right-[16.66%] top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/50 animate-ping" style={{ animationDelay: '1s' }} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-6 lg:gap-8 xl:gap-12 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-7 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/80 dark:border-slate-700/80 group relative overflow-hidden hover:-translate-y-2"
              >
                {/* Glowing border on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/0 via-purple-600/0 to-indigo-600/0 group-hover:from-primary/10 group-hover:via-purple-600/10 group-hover:to-indigo-600/10 transition-all duration-500 border-2 border-transparent group-hover:border-primary/30 dark:group-hover:border-purple-500/30" />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Step Number Badge with Icon */}
                  <div className="flex flex-col items-center mb-6 md:mb-8">
                    <div className="relative group/badge">
                      {/* Outer glow ring */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-purple-600 to-indigo-600 opacity-20 group-hover/badge:opacity-40 blur-xl group-hover:scale-150 transition-all duration-500" />
                      
                      {/* Main badge */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-22 md:h-22 lg:w-28 lg:h-28 mx-auto rounded-full bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center text-3xl sm:text-4xl md:text-3xl lg:text-5xl font-black text-white shadow-xl shadow-primary/40 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary/60 transition-all duration-500 relative z-10">
                        <span className="relative z-10">{step.number}</span>
                        {/* Shine effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      
                      {/* Icon Badge */}
                      <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 text-3xl sm:text-4xl md:text-3xl lg:text-4xl opacity-70 group-hover:opacity-100 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 z-20 drop-shadow-lg">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-full bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-primary/20 dark:border-purple-500/30">
                          {step.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Text */}
                  <div className="text-center space-y-3 md:space-y-4">
                    <h3 className="text-xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary dark:group-hover:text-purple-400 transition-colors duration-500">
                      {step.title}
                    </h3>
                    
                    <p className="text-sm sm:text-base md:text-sm lg:text-base xl:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-sm mx-auto">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow connector - Mobile/Tablet */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center my-8">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/30 animate-bounce">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
