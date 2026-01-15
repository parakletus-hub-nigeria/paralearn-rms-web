const ToolsSection = () => {
  return (
    <section className="min-h-[700px] py-24 md:py-40 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
          {/* Content */}
          <div className="flex-1 space-y-10 max-w-2xl order-2 lg:order-1">
            <div className="inline-block px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-widest">
              Educational Empowerment
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black leading-[1.1] text-slate-900 dark:text-white tracking-tight">
              <span className="text-hero italic">Tools</span> For Teachers <br />
              And Learners
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xl md:text-2xl leading-relaxed font-medium">
              Class offers a dynamic suite of teaching tools designed for
              real-time use during lessons. Educators can distribute assignments
              instantly.
            </p>
             <p className="text-slate-500 dark:text-slate-500 text-lg leading-relaxed">
               Ensuring that every student has access to the resources they need to thrive in a digital-first world.
            </p>
            <div className="pt-4">
              <button className="h-16 px-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg hover:-translate-y-1 transition-all shadow-xl">
                 Discover Features
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 relative w-full lg:max-w-2xl order-1 lg:order-2">
            <div className="absolute -inset-10 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative group">
              <div
                className="relative overflow-hidden rounded-[3rem] rounded-tr-[6rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-4 border-white dark:border-slate-800 transition-all duration-700 group-hover:scale-[1.02]"
                style={{
                  borderRadius: "6rem 3rem 3rem 3rem",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop"
                  alt="Students using technology"
                  className="w-full h-[400px] md:h-[550px] object-cover hover:scale-110 transition-transform duration-[2s]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent opacity-60" />
              </div>
              
              {/* Decorative floating square */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 dark:bg-primary/10 rounded-3xl blur-2xl -z-10 group-hover:scale-150 transition-transform duration-1000" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default ToolsSection;
