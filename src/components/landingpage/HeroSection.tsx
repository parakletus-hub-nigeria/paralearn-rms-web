import { Button } from "@/components/ui/button";
import AfricaGlobe from "./AfricaGlobe";

const HeroSection = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-32">
          {/* Left content */}
          <div className="flex-1 space-y-12 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 animate-fade-in">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               <span className="text-sm font-black text-primary uppercase tracking-widest">The Future of African Education</span>
            </div>

            <div className="space-y-4 relative">
               {/* Background Glow accent */}
               <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
               
               <h1 className="text-5xl md:text-7xl lg:text-9xl font-black leading-[1] tracking-tighter animate-fade-in relative z-10">
                 <span className="text-hero italic drop-shadow-sm">Empowering</span> <br />
                 <span className="text-slate-900 dark:text-white">Educators,</span>
               </h1>
               <h2
                 className="text-4xl md:text-6xl lg:text-8xl font-black text-slate-800 dark:text-white leading-[1.1] animate-fade-in flex flex-wrap items-baseline gap-4"
                 style={{ animationDelay: "0.1s" }}
               >
                 Engaging <span className="text-primary italic relative inline-block">
                    Learners.
                    <div className="absolute -bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-1 rounded-full" />
                 </span>
               </h2>
            </div>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in font-medium"
               style={{ animationDelay: "0.2s" }}
            >
              Paralearn LMS is an intuitive, feature-packed platform
              crafted to simplify and enhance the educational experience across
              Africa.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button
                size="lg"
                className="w-full sm:w-auto h-16 px-12 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Enroll your school
              </Button>
              <button className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg hover:text-primary transition-colors group">
                 <div className="w-14 h-14 rounded-full border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M8 5v14l11-7z" />
                    </svg>
                 </div>
                 Watch Demo
              </button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-60">
               <div className="flex flex-col">
                  <span className="text-2xl font-black">50k+</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Students</span>
               </div>
               <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
               <div className="flex flex-col">
                  <span className="text-2xl font-black">1.2k+</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Schools</span>
               </div>
            </div>
          </div>

          {/* Right illustration */}
          <div
            className="flex-1 flex justify-center lg:justify-end animate-fade-in w-full max-w-2xl"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="relative group">
               <div className="absolute inset-0 bg-primary/20 blur-[150px] group-hover:bg-primary/30 transition-all rounded-full" />
               <div className="relative transform hover:scale-110 transition-transform duration-1000">
                  <AfricaGlobe />
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default HeroSection;
