const TrustedBySection = () => {
  return (
    <div className="w-full px-6 md:px-12 lg:px-24 py-24 md:py-48">
      <section className="container mx-auto">
        <div className="flex flex-col items-center justify-center space-y-24">
          <div className="text-center space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-widest">
               Our Network
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-center tracking-tight">
              <span className="text-hero italic">Trusted</span> By Leading Institutions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 max-w-6xl w-full">
            {/* Havilah Academy Card */}
            <div className="card-premium p-16 flex flex-col items-center justify-center transform hover:scale-[1.05] transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-center space-y-8 relative z-10">
                <div className="relative mx-auto">
                  <div className="w-32 h-32 mx-auto rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl transform group-hover:rotate-6 transition-transform">
                    <svg viewBox="0 0 60 60" className="w-20 h-20 text-white">
                      <circle cx="30" cy="15" r="4" fill="currentColor" />
                      <path
                        d="M20 35 L30 20 L40 35 L30 50 Z"
                        fill="currentColor"
                      />
                      <path
                        d="M15 45 L45 45 L45 55 L15 55 Z"
                        fill="currentColor"
                        opacity="0.7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase">
                    HAVILAH
                  </span>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    ACADEMY
                  </h3>
                  <p className="text-sm text-slate-500 font-medium italic">
                    "Growing in wisdom and stature"
                  </p>
                </div>
              </div>
            </div>

            {/* La Vie School Card */}
            <div className="card-premium p-16 flex flex-col items-center justify-center transform hover:scale-[1.05] transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-transparent dark:from-orange-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-center space-y-8 relative z-10">
                <div className="relative mx-auto">
                  <div className="w-32 h-32 mx-auto flex items-center justify-center transform group-hover:-rotate-6 transition-transform">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                        <svg viewBox="0 0 24 24" className="w-12 h-12 text-white">
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M4 12 Q12 6 20 12 Q12 18 4 12"
                            fill="currentColor"
                            opacity="0.3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-orange-600 tracking-tighter">
                    LA VIE
                  </h3>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    School of Languages
                  </p>
                  <p className="text-sm text-slate-500 font-medium italic">
                    Knowledge • Excellence • Imagination
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


export default TrustedBySection;
