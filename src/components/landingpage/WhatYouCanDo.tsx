const WhatYouCanDo = () => {
  return (
    <section className="min-h-[700px] py-24 md:py-40 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
          {/* Left content */}
          <div className="flex-1 space-y-10 max-w-2xl">
            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest">
              Digital Transformation
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-[1.1] text-slate-900 dark:text-white tracking-tight">
              Everything in a physical classroom,{" "}
              <span className="text-hero italic">reimagined.</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xl md:text-2xl leading-relaxed font-medium">
              Paralearn enables both traditional
              and online schools to seamlessly handle scheduling, attendance,
              payments, and virtual classrooms—all within one secure,
              cloud-based system.
            </p>
            <div className="flex items-center gap-8 pt-4">
               <div className="flex flex-col">
                  <span className="text-3xl font-black text-primary">100%</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Digital</span>
               </div>
               <div className="w-px h-12 bg-slate-200 dark:bg-slate-800" />
               <div className="flex flex-col">
                  <span className="text-3xl font-black text-primary">24/7</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cloud Access</span>
               </div>
            </div>
          </div>

          {/* Right image with custom shape */}
          <div className="flex-1 relative w-full lg:max-w-2xl">
            <div className="absolute -inset-10 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative group">
              {/* Image container with custom border radius */}
              <div
                className="relative overflow-hidden rounded-[3rem] rounded-tl-[6rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-4 border-white dark:border-slate-800 transition-all duration-700 group-hover:scale-[1.02]"
                style={{
                  borderRadius: "6rem 3rem 3rem 3rem",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1544717297-fa134d392725?q=80&w=2070&auto=format&fit=crop"
                  alt="Modern learning environment"
                  className="w-full h-[400px] md:h-[550px] object-cover hover:scale-110 transition-transform duration-[2s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-10 left-10 text-white">
                   <p className="text-2xl font-black">Empower Your Class</p>
                   <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Start Today</p>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-fade-in group-hover:-translate-y-2 transition-transform">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                       <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                       </svg>
                    </div>
                    <div>
                       <p className="text-slate-900 dark:text-white font-black">Secure Payments</p>
                       <p className="text-slate-400 text-xs font-bold uppercase">Fully Automated</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default WhatYouCanDo;
