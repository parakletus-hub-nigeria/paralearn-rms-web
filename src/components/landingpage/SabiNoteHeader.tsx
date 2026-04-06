"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/mainLogo.svg";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { routespath } from "@/lib/routepath";

const SabiNoteHeader = () => {
  const [scrolled, setScrolled] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    lastScrollYRef.current = window.scrollY ?? document.documentElement.scrollTop;

    const handleScroll = () => {
      const currentScrollY = window.scrollY ?? document.documentElement.scrollTop;
      const last = lastScrollYRef.current;

      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrolled(height > 0 ? (currentScrollY / height) * 100 : 0);

      if (currentScrollY > last && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < last) {
        setIsVisible(true);
      }
      if (currentScrollY < 100) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 px-2 md:px-4 py-3 bg-transparent transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav className="max-w-6xl mx-auto h-16 md:h-20 px-4 md:px-6 bg-white rounded-full flex items-center justify-between border border-gray-200/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
        <div className="absolute bottom-0 left-0 h-[3px] bg-slate-200/50 transition-all duration-150 ease-out z-50 overflow-hidden w-full rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 shadow-lg shadow-purple-500/50 transition-all duration-300 ease-out" 
            style={{ width: `${scrolled}%` }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

        <div className="flex items-center gap-2 relative z-10 cursor-pointer shrink-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-start justify-center">
              <span className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">SabiNote</span>
              <span className="text-[10px] md:text-xs font-bold text-slate-500 mt-[-4px]">by</span>
            </div>
            <div className="relative block h-6 sm:h-8 w-24 sm:w-32 bg-transparent mt-1">
              <Image
                src={logo}
                fill
                className="object-contain object-left"
                alt="paralearn logo"
                priority
                sizes="(max-width: 640px) 100px, 150px"
              />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link href={routespath.SIGNIN} className="hidden sm:block">
            <button 
              className="text-sm font-bold text-slate-900 px-4 py-2.5 hover:bg-slate-100 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-200"
            >
              Log In
            </button>
          </Link>
          <Link href={routespath.SIGNIN}>
            <Button className="rounded-full px-5 md:px-8 h-10 md:h-11 font-black shadow-md shadow-purple-500/30 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 text-xs sm:text-sm">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default SabiNoteHeader;
