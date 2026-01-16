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
    <section className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-32 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
        </div>

        <div className="relative">
          {/* Horizontal flow line */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-indigo-600 z-0" />
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 group text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>
                  <div className="absolute -top-2 -right-2 text-4xl opacity-50">
                    {step.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
