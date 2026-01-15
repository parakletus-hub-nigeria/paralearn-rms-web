import Image from "next/image";

const WhatIsParalearnSection = () => {
  return (
    <section className="py-32 md:py-48 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Decorative Elements */}
        <div className="text-center mb-20 md:mb-32 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-px h-24 bg-gradient-to-b from-transparent to-primary/20" />
          
          <h2 className="text-4xl md:text-5xl lg:text-9xl font-black mb-10 tracking-tighter">
            What is <span className="text-hero italic drop-shadow-sm">Paralearn</span>?
          </h2>
          <p className="text-xl md:text-3xl text-slate-600 dark:text-slate-400 max-w-5xl mx-auto leading-relaxed font-medium">
            Paralearn empowers educators to <span className="text-primary italic">effortlessly</span> create online classes,
            organize course materials, manage assignments, quizzes, and exams — all from
            one centralized, <span className="font-black text-slate-900 dark:text-white underline decoration-primary/40">high-performance</span> platform.
          </p>
        </div>

        {/* Images Grid */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
          {/* Left Image */}
          <div className="relative group">
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all" />
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 transition-transform hover:-rotate-1 duration-500">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                alt="Students collaborating"
                className="w-full h-80 md:h-[450px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Right Image */}
          <div className="relative group md:mt-16">
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all" />
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 transition-transform hover:rotate-1 duration-500">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop"
                alt="Technology in classroom"
                className="w-full h-80 md:h-[450px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default WhatIsParalearnSection;
