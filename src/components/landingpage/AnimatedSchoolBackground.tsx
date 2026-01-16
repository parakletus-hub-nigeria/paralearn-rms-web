"use client";

import { useEffect, useRef } from "react";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";

const AnimatedSchoolBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      containerRef.current.style.setProperty('--mouse-x', `${x}%`);
      containerRef.current.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/20 via-purple-500/15 to-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-primary/10 via-purple-500/8 to-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* 3D School Building Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center perspective-1000"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Main School Building */}
        <div 
          className="relative transform-gpu transition-transform duration-300"
          style={{
            transform: 'translateZ(0) rotateY(calc((var(--mouse-x, 50%) - 50) * 0.1deg)) rotateX(calc((50 - var(--mouse-y, 50%)) * 0.1deg))',
          }}
        >
          {/* Building Base */}
          <div className="relative w-[300px] md:w-[400px] lg:w-[500px] h-[400px] md:h-[500px] lg:h-[600px]">
            {/* Main Building Structure */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-t-3xl shadow-2xl transform-gpu"
              style={{
                transform: 'translateZ(50px)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Building Windows */}
              <div className="absolute inset-0 p-8 md:p-12 lg:p-16">
                <div className="grid grid-cols-3 gap-4 h-full">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-blue-300/40 to-blue-500/40 dark:from-blue-500/30 dark:to-blue-700/30 rounded-lg shadow-inner border-2 border-blue-400/30 dark:border-blue-600/30 animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>

              {/* Building Roof */}
              <div className="absolute -top-8 left-0 right-0 h-16 bg-gradient-to-b from-red-500 via-red-600 to-red-700 rounded-t-3xl shadow-xl transform-gpu"
                style={{
                  transform: 'translateZ(30px) rotateX(-5deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>

              {/* School Flag */}
              <div className="absolute top-4 right-8 w-12 h-16 bg-gradient-to-b from-green-500 to-green-700 rounded-t-lg shadow-lg transform-gpu animate-float"
                style={{
                  transform: 'translateZ(60px)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="absolute top-0 left-0 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-green-800" />
              </div>

              {/* School Name Sign */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-6 py-3 rounded-xl shadow-xl border-2 border-primary/30 transform-gpu"
                style={{
                  transform: 'translateZ(40px)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <p className="text-xs md:text-sm font-black text-primary text-center">
                  PARA<span className="text-purple-600">LEARN</span>
                </p>
              </div>
            </div>

            {/* Side Wings */}
            <div className="absolute left-[-60px] top-20 w-32 h-48 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-300 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 rounded-l-2xl shadow-xl transform-gpu"
              style={{
                transform: 'translateZ(30px) rotateY(-20deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="p-4 grid grid-cols-2 gap-2 h-full">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-blue-300/40 dark:bg-blue-500/30 rounded shadow-inner border border-blue-400/30 dark:border-blue-600/30" />
                ))}
              </div>
            </div>

            <div className="absolute right-[-60px] top-20 w-32 h-48 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-300 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 rounded-r-2xl shadow-xl transform-gpu"
              style={{
                transform: 'translateZ(30px) rotateY(20deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="p-4 grid grid-cols-2 gap-2 h-full">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-blue-300/40 dark:bg-blue-500/30 rounded shadow-inner border border-blue-400/30 dark:border-blue-600/30" />
                ))}
              </div>
            </div>

            {/* Ground/Platform */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[120%] h-16 bg-gradient-to-b from-green-400 via-green-500 to-green-600 rounded-2xl shadow-2xl transform-gpu"
              style={{
                transform: 'translateZ(-20px) rotateX(10deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Ground texture */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]" />
            </div>
          </div>
        </div>

        {/* Floating Educational Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Graduation Cap */}
          <div className="absolute top-20 left-10 md:left-20 w-16 h-16 md:w-20 md:h-20 text-primary/30 dark:text-primary/20 animate-float-slow"
            style={{
              animationDelay: '0s',
              transform: 'translateZ(100px)',
            }}
          >
            <GraduationCap className="w-full h-full" />
          </div>

          {/* Book */}
          <div className="absolute top-40 right-10 md:right-20 w-12 h-12 md:w-16 md:h-16 text-purple-500/30 dark:text-purple-500/20 animate-float-slow"
            style={{
              animationDelay: '1s',
              transform: 'translateZ(80px)',
            }}
          >
            <BookOpen className="w-full h-full" />
          </div>

          {/* Users/Students */}
          <div className="absolute bottom-40 left-20 md:left-32 w-14 h-14 md:w-18 md:h-18 text-indigo-500/30 dark:text-indigo-500/20 animate-float-slow"
            style={{
              animationDelay: '2s',
              transform: 'translateZ(90px)',
            }}
          >
            <Users className="w-full h-full" />
          </div>

          {/* Award */}
          <div className="absolute bottom-20 right-20 md:right-32 w-12 h-12 md:w-16 md:h-16 text-primary/30 dark:text-primary/20 animate-float-slow"
            style={{
              animationDelay: '1.5s',
              transform: 'translateZ(70px)',
            }}
          >
            <Award className="w-full h-full" />
          </div>
        </div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              transform: `translateZ(${Math.random() * 50}px)`,
            }}
          />
        ))}
      </div>

      {/* Add custom animations to globals.css or use inline styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateZ(0);
          }
          50% {
            transform: translateY(-20px) translateZ(0);
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) translateZ(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) translateZ(0) rotate(5deg);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
};

export default AnimatedSchoolBackground;
