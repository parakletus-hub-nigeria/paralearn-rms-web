"use client";

import { Button } from "@/components/ui/button";
import AfricaGlobe from "./AfricaGlobe";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-40 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/20 via-purple-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"
          style={{ 
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-primary/20 rounded-full blur-3xl animate-pulse"
          style={{ 
            animationDelay: '1s',
            transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-32">
          {/* Left content */}
          <div className="flex-1 space-y-12 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-500/10 border border-primary/20 backdrop-blur-sm animate-fade-in hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/10">
               <div className="relative">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping opacity-75" />
               </div>
               <span className="text-sm font-black text-primary uppercase tracking-widest">The Future of African Education</span>
            </div>

            <div className="space-y-6 relative">
               {/* Enhanced Background Glow accent */}
               <div className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-primary/30 via-purple-500/20 to-transparent blur-[100px] rounded-full pointer-events-none animate-pulse" />
               
               <h1 className="text-5xl md:text-7xl lg:text-9xl font-black leading-[0.95] tracking-tighter animate-fade-in relative z-10">
                 <span className="text-hero italic drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-indigo-600 animate-gradient-x">Empowering</span> <br />
                 <span className="text-slate-900 dark:text-white relative inline-block">
                   Educators,
                   <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-purple-500/50 to-transparent blur-sm" />
                 </span>
               </h1>
               <h2
                 className="text-4xl md:text-6xl lg:text-8xl font-black text-slate-800 dark:text-white leading-[1.05] animate-fade-in flex flex-wrap items-baseline gap-4"
                 style={{ animationDelay: "0.1s" }}
               >
                 Engaging <span className="text-primary italic relative inline-block group">
                    Learners.
                    <div className="absolute -bottom-3 left-0 w-full h-4 bg-gradient-to-r from-primary/30 via-purple-500/30 to-indigo-500/30 -rotate-1 rounded-full blur-sm group-hover:rotate-0 transition-transform duration-300" />
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
                className="w-full sm:w-auto h-16 px-12 rounded-2xl text-lg font-black shadow-2xl shadow-primary/40 hover:-translate-y-1 hover:shadow-primary/60 transition-all duration-300 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:via-purple-500/90 hover:to-indigo-500/90 relative overflow-hidden group"
              >
                <span className="relative z-10">Enroll your school</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Button>
              <button className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg hover:text-primary transition-all duration-300 group">
                 <div className="relative w-14 h-14 rounded-full border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-primary/30">
                    <svg className="w-6 h-6 ml-1 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M8 5v14l11-7z" />
                    </svg>
                    <div className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-150 transition-transform duration-500 blur-xl" />
                 </div>
                 <span className="group-hover:translate-x-1 transition-transform duration-300">Watch Demo</span>
              </button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
               <div className="flex flex-col group cursor-default">
                  <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">50k+</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Students</span>
               </div>
               <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
               <div className="flex flex-col group cursor-default">
                  <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">1.2k+</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Schools</span>
               </div>
            </div>
          </div>

          {/* Right illustration */}
          <div
            className="flex-1 flex justify-center lg:justify-end animate-fade-in w-full max-w-2xl"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="relative group">
               <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-indigo-500/20 blur-[150px] group-hover:blur-[180px] group-hover:opacity-80 transition-all duration-500 rounded-full" />
               <div 
                 className="relative transform hover:scale-110 transition-transform duration-1000"
                 style={{
                   transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px) scale(1)`,
                   transition: 'transform 0.3s ease-out'
                 }}
               >
                  <AfricaGlobe />
               </div>
               {/* Floating particles effect */}
               <div className="absolute top-10 right-10 w-2 h-2 bg-primary rounded-full animate-ping opacity-75" style={{ animationDelay: '0s' }} />
               <div className="absolute bottom-20 left-10 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }} />
               <div className="absolute top-1/2 right-5 w-1 h-1 bg-indigo-500 rounded-full animate-ping opacity-75" style={{ animationDelay: '2s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default HeroSection;
