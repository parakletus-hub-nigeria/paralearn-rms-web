const FeaturesSection = () => {
  return (
    <section className="py-24 md:py-48 px-6 overflow-hidden relative">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-500/5 via-primary/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 md:mb-32 space-y-6">
           <div className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:via-emerald-900/20 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10">
              Interface Excellence
           </div>
           <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
             A <span className="text-hero italic bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-indigo-600 animate-gradient-x">User Interface</span> <br />
             Designed for the Classroom
           </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 max-w-7xl mx-auto">
          {/* Card 1 - Grid/Podium */}
          <div className="card-premium p-12 md:p-16 flex flex-col items-center justify-center group overflow-hidden relative hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/20 group-hover:blur-[40px] transition-all duration-500" />
            <div className="flex flex-col items-center text-center space-y-10 relative z-10">
              <div className="grid grid-cols-2 gap-3 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow"></div>
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-colors"></div>
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-colors"></div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-bold text-xl leading-relaxed">
                Teachers don&apos;t get lost in the grid view and have a
                dedicated <span className="text-primary font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Podium space.</span>
              </p>
            </div>
          </div>

          {/* Card 2 - Presenter */}
          <div className="card-premium p-12 md:p-16 flex flex-col items-center justify-center group overflow-hidden relative hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-purple-500/20 group-hover:blur-[40px] transition-all duration-500" />
            <div className="flex flex-col items-center text-center space-y-10 relative z-10">
              <div className="flex items-center gap-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center group-hover:shadow-purple-500/50 transition-shadow">
                   <div className="w-8 h-1.5 bg-white rounded-full" />
                </div>
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-colors"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-bold text-xl leading-relaxed">
                TA&apos;s and presenters can be moved to the <span className="text-purple-600 font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">front of the class</span> for better focus.
              </p>
            </div>
          </div>

          {/* Card 3 - Students View */}
          <div className="card-premium p-12 md:p-16 flex flex-col items-center justify-center group overflow-hidden relative hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-emerald-500/20 group-hover:blur-[40px] transition-all duration-500" />
            <div className="flex flex-col items-center text-center space-y-10 relative z-10">
              <div className="flex items-center -space-x-4 transform group-hover:space-x-2 group-hover:scale-110 transition-all duration-500">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full border-4 border-white dark:border-slate-900 shadow-xl group-hover:shadow-emerald-500/50 transition-shadow"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-4 border-white dark:border-slate-900 shadow-xl group-hover:shadow-blue-500/50 transition-shadow"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full border-4 border-white dark:border-slate-900 shadow-xl group-hover:shadow-amber-500/50 transition-shadow"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-bold text-xl leading-relaxed">
                Teachers can easily see <span className="text-emerald-500 font-black bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">all students</span> and class data at one time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default FeaturesSection;
