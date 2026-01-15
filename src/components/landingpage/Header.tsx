"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "../../images/IMG-20201027-WA0000_2-removebg-preview 1.png";
import { useEffect, useState } from "react";

const Header = () => {
  const [scrolled, setScrolled] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (winScroll / height) * 100;
      setScrolled(scrollPercent);
      setIsScrolled(winScroll > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 px-6 transition-all duration-500 ${isScrolled ? 'py-2 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-lg' : 'py-4'}`}>
      <nav className="max-w-7xl mx-auto h-20 px-8 glass-card rounded-full flex items-center justify-between border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.12)] relative overflow-hidden group hover:shadow-[0_12px_40px_0_rgba(100,27,196,0.15)] transition-shadow duration-300">
        {/* Enhanced Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 h-[3px] bg-slate-200/50 dark:bg-slate-800/50 transition-all duration-150 ease-out z-50 overflow-hidden w-full rounded-full">
           <div 
             className="h-full bg-gradient-to-r from-primary via-purple-500 to-indigo-600 shadow-lg shadow-primary/50 transition-all duration-300 ease-out" 
             style={{ width: `${scrolled}%` }}
           />
        </div>

        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

        <div className="flex items-center gap-3 group cursor-pointer relative z-10">
           <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/20 to-indigo-500/30 blur-xl rounded-full group-hover:blur-2xl group-hover:scale-150 transition-all duration-500" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-all" />
              <Image
                src={logo}
                className="w-[45px] h-[45px] object-contain relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300"
                alt="paralearn logo"
              />
           </div>
           <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">PARALEARN</span>
        </div>

        <div className="flex items-center gap-8 md:gap-12 relative z-10">
          <div className="hidden lg:flex items-center gap-8">
            <a href="#products" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-all uppercase tracking-widest relative group">
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#school" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-all uppercase tracking-widest relative group">
              For Schools
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#about" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-all uppercase tracking-widest relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 group-hover:w-full transition-all duration-300" />
            </a>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="hidden sm:block text-sm font-bold text-slate-900 dark:text-white px-6 py-2.5 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-white/10 dark:hover:to-white/5 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-white/20 hover:shadow-md">
                Sign In
             </button>
             <Button className="rounded-full px-10 h-12 font-black shadow-2xl shadow-primary/40 hover:-translate-y-1 hover:shadow-primary/60 transition-all duration-300 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:via-purple-500/90 hover:to-indigo-500/90 relative overflow-hidden group">
               <span className="relative z-10">Enroll Now</span>
               <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
             </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};


export default Header;
