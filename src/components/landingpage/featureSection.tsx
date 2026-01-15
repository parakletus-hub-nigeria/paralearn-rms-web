const FeaturesSection = () => {
  return (
    <section className="py-24 md:py-48 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 md:mb-32 space-y-6">
           <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest">
              Interface Excellence
           </div>
           <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
             A <span className="text-hero italic">User Interface</span> <br />
             Designed for the Classroom
           </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 max-w-7xl mx-auto">
          {/* Card 1 - Grid/Podium */}
          <div className="card-premium p-12 md:p-16 flex flex-col items-center justify-center group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-all" />
            <div className="flex flex-col items-center text-center space-y-10 relative z-10">
              <div className="grid grid-cols-2 gap-3 transform group-hover:rotate-12 transition-transform duration-500">
                <div className="w-10 h-10 bg-primary rounded-xl shadow-lg shadow-primary/20"></div>
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="w-10 h-10 bg-primary rounded-xl shadow-lg shadow-primary/20"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-bold text-xl leading-relaxed">
                Teachers don&apos;t get lost in the grid view and have a
                dedicated <span className="text-primary">Podium space.</span>
              </p>
            </div>
          </div>

          {/* Card 2 - Presenter */}
          <div className="card-premium p-12 md:p-16 flex flex-col items-center justify-center group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-purple-500/10 transition-all" />
            <div className="flex flex-col items-center text-center space-y-10 relative z-10">
              <div className="flex items-center gap-4 transform group-hover:scale-110 transition-transform duration-500">
                <div className="w-14 h-14 bg-purple-600 rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-center">
                   <div className="w-6 h-1 bg-white rounded-full" />
                </div>
                <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-bold text-xl leading-relaxed">
                TA&apos;s and presenters can be moved to the <span className="text-purple-600">front of the class</span> for better focus.
              </p>
            </div>
          </div>

          {/* Card 3 - Students View */}
          <div className="card-premium p-12 md:p-16 flex flex-col items-center justify-center group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="flex flex-col items-center text-center space-y-10 relative z-10">
              <div className="flex items-center -space-x-4 transform group-hover:space-x-1 transition-all duration-500">
                <div className="w-14 h-14 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 shadow-xl"></div>
                <div className="w-14 h-14 bg-blue-500 rounded-full border-4 border-white dark:border-slate-900 shadow-xl"></div>
                <div className="w-14 h-14 bg-amber-500 rounded-full border-4 border-white dark:border-slate-900 shadow-xl"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-bold text-xl leading-relaxed">
                Teachers can easily see <span className="text-emerald-500">all students</span> and class data at one time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default FeaturesSection;
