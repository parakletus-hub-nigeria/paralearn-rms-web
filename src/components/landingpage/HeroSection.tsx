"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { School, ArrowRight, GraduationCap, BookOpen, Users, Award } from "lucide-react";

const HeroSection = () => {
  const [storeName, setStoreName] = useState("");
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
    <section className="w-full px-6 md:px-12 lg:px-24 pt-32 md:pt-48 lg:pt-56 pb-12 md:pb-20 relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 min-h-[600px] md:min-h-[700px] lg:min-h-[800px]">
      {/* 3D Animated School Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
          className="absolute inset-0 flex items-center justify-center"
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
            <div className="relative w-[250px] md:w-[350px] lg:w-[450px] h-[300px] md:h-[400px] lg:h-[500px] opacity-40 dark:opacity-30">
              {/* Main Building Structure */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-200/50 via-slate-100/50 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/50 dark:to-slate-700/50 rounded-t-3xl shadow-2xl transform-gpu backdrop-blur-sm"
                style={{
                  transform: 'translateZ(50px)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Building Windows */}
                <div className="absolute inset-0 p-6 md:p-10 lg:p-12">
                  <div className="grid grid-cols-3 gap-3 h-full">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-br from-blue-300/30 to-blue-500/30 dark:from-blue-500/20 dark:to-blue-700/20 rounded-lg shadow-inner border-2 border-blue-400/20 dark:border-blue-600/20 animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Building Roof */}
                <div className="absolute -top-6 left-0 right-0 h-12 bg-gradient-to-b from-red-500/50 via-red-600/50 to-red-700/50 rounded-t-3xl shadow-xl transform-gpu"
                  style={{
                    transform: 'translateZ(30px) rotateX(-5deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>

                {/* School Flag */}
                <div className="absolute top-3 right-6 w-10 h-12 bg-gradient-to-b from-green-500/50 to-green-700/50 rounded-t-lg shadow-lg transform-gpu animate-float"
                  style={{
                    transform: 'translateZ(60px)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="absolute top-0 left-0 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-green-800/50" />
                </div>
              </div>

              {/* Side Wings */}
              <div className="absolute left-[-50px] top-16 w-24 h-36 bg-gradient-to-b from-slate-300/50 via-slate-200/50 to-slate-300/50 dark:from-slate-600/50 dark:via-slate-500/50 dark:to-slate-600/50 rounded-l-2xl shadow-xl transform-gpu backdrop-blur-sm"
                style={{
                  transform: 'translateZ(30px) rotateY(-20deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="p-3 grid grid-cols-2 gap-2 h-full">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-blue-300/30 dark:bg-blue-500/20 rounded shadow-inner border border-blue-400/20 dark:border-blue-600/20" />
                  ))}
                </div>
              </div>

              <div className="absolute right-[-50px] top-16 w-24 h-36 bg-gradient-to-b from-slate-300/50 via-slate-200/50 to-slate-300/50 dark:from-slate-600/50 dark:via-slate-500/50 dark:to-slate-600/50 rounded-r-2xl shadow-xl transform-gpu backdrop-blur-sm"
                style={{
                  transform: 'translateZ(30px) rotateY(20deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="p-3 grid grid-cols-2 gap-2 h-full">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-blue-300/30 dark:bg-blue-500/20 rounded shadow-inner border border-blue-400/20 dark:border-blue-600/20" />
                  ))}
                </div>
              </div>

              {/* Ground/Platform */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[120%] h-12 bg-gradient-to-b from-green-400/40 via-green-500/40 to-green-600/40 rounded-2xl shadow-2xl transform-gpu"
                style={{
                  transform: 'translateZ(-20px) rotateX(10deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]" />
              </div>
            </div>
          </div>

          {/* Floating Educational Icons */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Graduation Cap */}
            <div className="absolute top-20 left-10 md:left-20 w-12 h-12 md:w-16 md:h-16 text-primary/20 dark:text-primary/10 animate-float-slow"
              style={{
                animationDelay: '0s',
                transform: 'translateZ(100px)',
              }}
            >
              <GraduationCap className="w-full h-full" />
            </div>

            {/* Book */}
            <div className="absolute top-40 right-10 md:right-20 w-10 h-10 md:w-14 md:h-14 text-purple-500/20 dark:text-purple-500/10 animate-float-slow"
              style={{
                animationDelay: '1s',
                transform: 'translateZ(80px)',
              }}
            >
              <BookOpen className="w-full h-full" />
            </div>

            {/* Users/Students */}
            <div className="absolute bottom-40 left-20 md:left-32 w-12 h-12 md:w-16 md:h-16 text-indigo-500/20 dark:text-indigo-500/10 animate-float-slow"
              style={{
                animationDelay: '2s',
                transform: 'translateZ(90px)',
              }}
            >
              <Users className="w-full h-full" />
            </div>

            {/* Award */}
            <div className="absolute bottom-20 right-20 md:right-32 w-10 h-10 md:w-14 md:h-14 text-primary/20 dark:text-primary/10 animate-float-slow"
              style={{
                animationDelay: '1.5s',
                transform: 'translateZ(70px)',
              }}
            >
              <Award className="w-full h-full" />
            </div>
          </div>

          {/* Floating Particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-primary/15 rounded-full animate-float"
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
      </div>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left content */}
          <div className="flex-1 space-y-8 text-center lg:text-left w-full lg:w-auto">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                Restore Calm to Your School's Administration.
              </h1>
            </div>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              Move from chaotic paper trails and compilation bottlenecks to a unified, digital system. ParaLearn simplifies result management so you can focus on education, not paperwork.
            </p>

            {/* Primary CTA - Input Field Style */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 focus-within:border-primary dark:focus-within:border-primary shadow-sm">
                <div className="flex items-center gap-3 px-4 py-4">
                  <School className="w-5 h-5 text-primary flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter your school name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="flex-1 bg-transparent border-0 outline-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-base"
                  />
                  <button
                    onClick={() => {
                      if (storeName.trim()) {
                        // Handle registration
                        window.location.href = "/auth/signup";
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-primary/30 flex-shrink-0"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Link */}
            <div className="pt-2">
              <button
                onClick={() => {
                  const event = new CustomEvent('openLoginModal');
                  window.dispatchEvent(event);
                }}
                className="text-base font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
              >
                Already have an account? Log In
              </button>
            </div>
          </div>

          {/* Right 3D Illustration */}
          <div className="flex-1 flex justify-center lg:justify-end w-full max-w-2xl">
            <div className="relative w-full max-w-lg" style={{ perspective: "1000px" }}>
              {/* 3D Container */}
              <div 
                className="relative transform-gpu"
                style={{
                  transformStyle: "preserve-3d",
                  transform: "rotateY(-5deg) rotateX(2deg)",
                }}
              >
                {/* Platform/Ground */}
                <div className="absolute -bottom-8 left-0 right-0 h-24 bg-gradient-to-t from-slate-200/50 to-slate-100/30 dark:from-slate-800/50 dark:to-slate-700/30 rounded-2xl blur-xl" />
                
                {/* Main Scene Container */}
                <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
                  {/* Split Screen Illustration */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left: Stressed Administrator */}
                    <div className="relative bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-2xl p-6 border-2 border-red-200/50 dark:border-red-900/30">
                      {/* 3D Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                      
                      <div className="relative z-10">
                        <div className="text-5xl mb-3 text-center">😰</div>
                        {/* Paper stacks */}
                        <div className="space-y-2 mb-3">
                          <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded shadow-sm transform rotate-[-2deg]" />
                          <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded shadow-sm transform rotate-[1deg]" />
                          <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded shadow-sm transform rotate-[-1deg]" />
                        </div>
                        <div className="h-6 bg-red-200 dark:bg-red-900/40 rounded text-xs text-center flex items-center justify-center text-red-700 dark:text-red-300 font-bold">
                          CHAOS
                        </div>
                      </div>
                    </div>

                    {/* Right: Calm Dashboard */}
                    <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl p-6 border-2 border-emerald-200/50 dark:border-emerald-900/30">
                      {/* 3D Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                      
                      <div className="relative z-10">
                        <div className="text-5xl mb-3 text-center">☕</div>
                        {/* Clean Dashboard */}
                        <div className="space-y-2 mb-3">
                          <div className="h-6 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded shadow-sm" />
                          <div className="h-4 bg-primary/20 rounded" />
                          <div className="h-4 bg-primary/20 rounded w-3/4" />
                        </div>
                        <div className="h-6 bg-emerald-200 dark:bg-emerald-900/40 rounded text-xs text-center flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
                          CALM
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conveyor Belt Effect */}
                  <div className="absolute -top-4 left-8 right-8 h-3 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 rounded-full shadow-lg transform rotate-[-2deg]" />
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary/20 rounded-lg transform rotate-12 shadow-md" />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-500/20 rounded-full transform -rotate-12 shadow-md" />
                </div>

                {/* Shadow */}
                <div className="absolute -bottom-4 left-4 right-4 h-8 bg-black/10 dark:bg-black/20 rounded-full blur-2xl transform translate-y-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
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
      `}</style>
    </section>
  );
};


export default HeroSection;
