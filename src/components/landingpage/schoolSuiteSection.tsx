const SchoolSuiteSection = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-24 md:py-48">
      <div className="max-w-5xl mx-auto text-center space-y-12">
        <div className="space-y-6">
           <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              Unified Platform
           </div>
           <h2 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tight leading-[1.05] animate-fade-in">
             <span className="text-hero italic">All-In-One</span> <br />
             School Suite
           </h2>
        </div>
        <p
          className="text-slate-600 dark:text-slate-400 text-xl md:text-2xl lg:text-3xl leading-relaxed animate-fade-in font-medium max-w-4xl mx-auto"
          style={{ animationDelay: "0.1s" }}
        >
          From managing online courses to tracking student progress and boosting
          engagement, Paralearn LMS equips educators and institutions with all
          the tools they need in one powerful, <span className="text-slate-900 dark:text-white font-black italic underline decoration-primary/30">easy-to-use</span> platform.
        </p>
        
        <div className="pt-8">
           <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span>Reliable</span>
              <span className="text-primary">•</span>
              <span>Secure</span>
              <span className="text-primary">•</span>
              <span>Scalable</span>
              <span className="text-primary">•</span>
              <span>Modern</span>
           </div>
        </div>
      </div>
    </section>
  );
};


export default SchoolSuiteSection;
