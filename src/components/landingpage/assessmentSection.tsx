import { Check, X } from "lucide-react";
import { Button } from "../ui/button";
const AssessmentsSection = () => {
  return (
    <section className="min-h-[800px] py-32 md:py-48 px-6 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-24 lg:gap-32">
          {/* Quiz Card */}
          <div className="flex-1 flex justify-center relative w-full order-2 lg:order-1">
            {/* Decorative elements with more breathing room */}
            <div className="absolute -top-12 -left-12 w-6 h-6 rounded-full bg-amber-400 opacity-60"></div>
            <div className="absolute -bottom-16 left-20 w-8 h-8 rounded-full bg-emerald-500 opacity-40"></div>
            <div className="absolute top-1/4 -right-8 w-5 h-5 rounded-full bg-pink-500 opacity-50"></div>

            {/* Subtle Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-100/30 dark:bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative glass-card rounded-[3rem] p-12 md:p-16 max-w-2xl w-full border border-white/20 dark:border-slate-800/50 transition-all hover:shadow-[0_80px_150px_-20px_rgba(100,27,196,0.2)]">
              {/* Floating Decorative Orbs within card */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />

              {/* Answer buttons - Bigger and more spaced */}
              <div className="absolute -top-8 right-12 flex gap-6 z-20">
                <button className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-900/50 flex items-center justify-center shadow-2xl hover:scale-110 transition-all hover:bg-red-50 hover:shadow-red-500/20">
                  <X className="w-8 h-8 text-red-500" />
                </button>
                <button className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center shadow-2xl hover:scale-110 transition-all hover:bg-emerald-50 hover:shadow-emerald-500/20">
                  <Check className="w-8 h-8 text-emerald-500" />
                </button>
              </div>

              <div className="space-y-10 relative z-10">
                <div className="flex justify-between items-center">
                   <span className="inline-block px-8 py-2.5 bg-primary/10 text-primary text-lg font-black rounded-full uppercase tracking-widest">
                     Question 1
                   </span>
                   <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i===1 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />)}
                   </div>
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter">
                  True or false? <br />
                  <span className="italic text-slate-500">This play takes place in Italy</span>
                </h3>
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10 group/img">
                  <img
                    src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=1200"
                    alt="Venice, Italy"
                    className="w-full h-80 object-cover transform transition-transform duration-[2s] group-hover/img:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                </div>
              </div>

              {/* Success notification - More prominent */}
              <div className="absolute -bottom-12 -right-8 flex items-center gap-6 bg-white dark:bg-slate-800 shadow-[0_30px_60px_-15px_rgba(16,185,129,0.25)] px-8 py-6 rounded-3xl border border-emerald-100 dark:border-emerald-900 animate-bounce-subtle">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-emerald-600 dark:text-emerald-400 font-black text-lg">
                    Sent successfully!
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                    Your answer was received.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content - Massive and spaced */}
          <div className="flex-1 space-y-12 max-w-2xl text-center lg:text-left order-1 lg:order-2">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] text-slate-900 dark:text-white tracking-tight">
                Assessments, <br />
                <span className="text-primary italic">Quizzes,</span> <br />
                & Tests
              </h2>
              <div className="h-2 w-24 bg-primary rounded-full hidden lg:block"></div>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 text-xl md:text-2xl leading-relaxed font-medium">
              Class offers a dynamic suite of teaching tools designed for
              real-time use during lessons. Educators can distribute assignments
              instantly.
            </p>
            
            <p className="text-slate-500 dark:text-slate-500 text-lg leading-relaxed">
               Allow students to complete and submit them seamlessly within the platform, enhancing engagement and feedback loops.
            </p>

            <div className="pt-8">
              <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all">
                Explore All Tools
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



export default AssessmentsSection;
