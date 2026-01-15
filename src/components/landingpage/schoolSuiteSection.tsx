const SchoolSuiteSection = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-24 md:py-48 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
        <div className="space-y-6">
           <div className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-500/10 border border-primary/20 backdrop-blur-sm text-primary text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:scale-105 transition-transform duration-300">
              Unified Platform
           </div>
           <h2 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tight leading-[1.05] animate-fade-in">
             <span className="text-hero italic bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-indigo-600 animate-gradient-x">All-In-One</span> <br />
             <span className="text-slate-900 dark:text-white">School Suite</span>
           </h2>
        </div>
        <p
          className="text-slate-600 dark:text-slate-400 text-xl md:text-2xl lg:text-3xl leading-relaxed animate-fade-in font-medium max-w-4xl mx-auto"
          style={{ animationDelay: "0.1s" }}
        >
          From managing online courses to tracking student progress and boosting
          engagement, Paralearn LMS equips educators and institutions with all
          the tools they need in one powerful, <span className="text-slate-900 dark:text-white font-black italic underline decoration-2 decoration-primary/40 underline-offset-4 hover:decoration-primary transition-colors">easy-to-use</span> platform.
        </p>
        
        <div className="pt-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
           <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <span className="px-4 py-2 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary hover:scale-105 transition-all duration-300 cursor-default">Reliable</span>
              <span className="px-4 py-2 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary hover:scale-105 transition-all duration-300 cursor-default">Secure</span>
              <span className="px-4 py-2 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary hover:scale-105 transition-all duration-300 cursor-default">Scalable</span>
              <span className="px-4 py-2 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary hover:scale-105 transition-all duration-300 cursor-default">Modern</span>
           </div>
        </div>
      </div>
    </section>
  );
};


export default SchoolSuiteSection;
