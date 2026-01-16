"use client";

const BenefitsSection = () => {
  const benefits = [
    {
      title: "Eliminate the End-of-Term Bottleneck",
      category: "Administrative Efficiency",
      description: "You shouldn't have to pause school operations just to generate report cards. ParaLearn automates the compilation of broadsheets. Whether you are managing 50 students or 5,000, approval and publishing happen in clicks, not weeks.",
      icon: "⚡",
    },
    {
      title: "Assessments You Can Trust",
      category: "Assessment Integrity",
      description: "Preserve the sanctity of your exams with audit-ready security. Our system actively monitors for malpractice, flagging interruptions and tab-switching during assessments, so the grades students get are the grades they actually earned.",
      icon: "🛡️",
    },
    {
      title: "Give Teachers Their Weekends Back",
      category: "Teacher Empowerment",
      description: "Reduce the burnout associated with grading hundreds of scripts. With automated grading for objective questions and easy score entry for theory, your teachers spend less time calculating and more time teaching.",
      icon: "👨‍🏫",
    },
    {
      title: "Build Trust with Instant Transparency",
      category: "Parent/Student Access",
      description: "End the anxiety of 'missing results.' Once you approve a report, it is immediately available to parents and students via their secure mobile portal. No lost papers, no confusion—just clear, accessible progress tracking.",
      icon: "📱",
    },
  ];

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Why Schools Switch
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Focused on outcomes, not technical specs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 group"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-indigo-500/20 dark:from-primary/30 dark:via-purple-500/30 dark:to-indigo-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-black uppercase tracking-widest text-primary mb-2 block">
                    {benefit.category}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {benefit.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
