"use client";

const BenefitsSection = () => {
  const benefits = [
    {
      title: "Eliminate the End-of-Term Bottleneck",
      category: "Administrative Efficiency",
      description: "You shouldn't have to pause school operations just to generate report cards. ParaLearn automates the compilation of broadsheets. Whether you are managing 50 students or 5,000, approval and publishing happen in clicks, not weeks.",
      icon: "⚡",
      gradient: "from-yellow-400 via-orange-500 to-red-500",
    },
    {
      title: "Assessments You Can Trust",
      category: "Assessment Integrity",
      description: "Preserve the sanctity of your exams with audit-ready security. Our system actively monitors for malpractice, flagging interruptions and tab-switching during assessments, so the grades students get are the grades they actually earned.",
      icon: "🛡️",
      gradient: "from-blue-400 via-indigo-500 to-purple-600",
    },
    {
      title: "Give Teachers Their Weekends Back",
      category: "Teacher Empowerment",
      description: "Reduce the burnout associated with grading hundreds of scripts. With automated grading for objective questions and easy score entry for theory, your teachers spend less time calculating and more time teaching.",
      icon: "👨‍🏫",
      gradient: "from-green-400 via-emerald-500 to-teal-600",
    },
    {
      title: "Build Trust with Instant Transparency",
      category: "Parent/Student Access",
      description: "End the anxiety of 'missing results.' Once you approve a report, it is immediately available to parents and students via their secure mobile portal. No lost papers, no confusion—just clear, accessible progress tracking.",
      icon: "📱",
      gradient: "from-pink-400 via-purple-500 to-indigo-600",
    },
  ];

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/30">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-600/10 border border-primary/20 dark:border-primary/30">
            <span className="text-xs sm:text-sm font-bold text-primary dark:text-purple-400 uppercase tracking-widest">
              Real Benefits
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl font-black text-slate-900 dark:text-white mb-4 md:mb-5 tracking-tight">
            Why Schools Switch
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium">
            Focused on outcomes, not technical specs
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-primary rounded-full" />
            <div className="w-1 h-1 rounded-full bg-primary" />
            <div className="w-16 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-indigo-600 rounded-full" />
            <div className="w-1 h-1 rounded-full bg-indigo-600" />
            <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-transparent rounded-full" />
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-7 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/80 dark:border-slate-700/80 group relative overflow-hidden hover:-translate-y-2"
            >
              {/* Gradient border on hover */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon and Header */}
                <div className="flex items-start gap-4 md:gap-5 mb-6 md:mb-8">
                  {/* Icon Container */}
                  <div className="relative flex-shrink-0">
                    {/* Icon glow */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${benefit.gradient} opacity-20 group-hover:opacity-40 blur-xl group-hover:scale-150 transition-all duration-500`} />
                    
                    {/* Icon */}
                    <div className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center text-3xl sm:text-4xl md:text-4xl lg:text-5xl shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500 relative z-10`}>
                      {benefit.icon}
                      {/* Shine effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                  
                  {/* Title Section */}
                  <div className="flex-1 pt-1">
                    <span className={`text-xs sm:text-xs md:text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${benefit.gradient} mb-2 block`}>
                      {benefit.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary dark:group-hover:text-purple-400 transition-colors duration-500">
                      {benefit.title}
                    </h3>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-sm sm:text-base md:text-sm lg:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {benefit.description}
                </p>

                {/* Bottom accent line */}
                <div className={`mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-700/60 group-hover:border-transparent transition-colors duration-500 relative`}>
                  <div className={`absolute top-0 left-0 h-0.5 w-0 bg-gradient-to-r ${benefit.gradient} group-hover:w-full transition-all duration-500 rounded-full`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
