  "use client";

  import { Button } from "@/components/ui/button";
  import Link from "next/link";
  import Image from "next/image";
  import logo from "../../../public/log.png";

  import { useEffect, useState } from "react";
  import { Menu, X } from "lucide-react";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

  const Header = () => {
    const [scrolled, setScrolled] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!mounted) return;
      
      let ticking = false;
      
      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const currentScrollY = window.scrollY || document.documentElement.scrollTop;
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (winScroll / height) * 100;
            setScrolled(scrollPercent);

            // Hide header when scrolling down, show when scrolling up
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
              // Scrolling down
              setIsVisible(false);
            } else if (currentScrollY < lastScrollY) {
              // Scrolling up
              setIsVisible(true);
            }

            // Always show header at the top
            if (currentScrollY < 100) {
              setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, mounted]);

    const navigationLinks = [
      { label: "Product", href: "/product" },
      { label: "For Schools", href: "#school" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ];

    return (
      <header 
        className={`fixed top-0 left-0 w-full z-50 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-transparent transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ willChange: 'transform' }}
      >
        <nav className="max-w-7xl mx-auto h-14 sm:h-16 md:h-20 px-4 sm:px-6 md:px-8 bg-white rounded-full flex items-center justify-between border border-gray-200/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
          {/* Enhanced Scroll Progress Bar */}
          <div className="absolute bottom-0 left-0 h-[2px] sm:h-[3px] bg-slate-200/50 dark:bg-slate-800/50 transition-all duration-150 ease-out z-50 overflow-hidden w-full rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-primary via-purple-500 to-indigo-600 shadow-lg shadow-primary/50 transition-all duration-300 ease-out" 
              style={{ width: `${scrolled}%` }}
            />
          </div>

          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer relative z-10">
            <Link href="/" className="relative bg-transparent">
              <Image
                src={logo}
                className="w-[200px] h-[200px] sm:w-[210px] sm:h-[210px] md:w-[220px] md:h-[220px] lg:w-[230px] lg:h-[230px] xl:w-[240px] xl:h-[240px] object-contain relative z-10"
                alt="paralearn logo"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 md:gap-12 relative z-10">
            <div className="flex items-center gap-8">
              {navigationLinks.map((link, index) => {
                const isHashLink = link.href.startsWith('#');
                
                if (isHashLink) {
                  return (
                    <a
                      key={index}
                      href={link.href}
                      className="header-nav-link text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors uppercase tracking-widest relative focus:outline-none"
                    >
                      {link.label}
                    </a>
                  );
                }
                
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className="header-nav-link text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors uppercase tracking-widest relative focus:outline-none"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                className="text-sm font-bold text-slate-900 dark:text-white px-4 md:px-6 py-2 sm:py-2.5 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-white/10 dark:hover:to-white/5 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-white/20 hover:shadow-md"
                onClick={() => {
                  const event = new CustomEvent('openLoginModal');
                  window.dispatchEvent(event);
                }}
              >
                  Sign In
              </button>
              <Button className="rounded-full px-6 md:px-10 h-10 sm:h-11 md:h-12 font-black shadow-2xl shadow-primary/40 hover:-translate-y-1 hover:shadow-primary/60 transition-all duration-300 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:via-purple-500/90 hover:to-indigo-500/90 relative overflow-hidden group text-xs sm:text-sm">
                <span className="relative z-10">Enroll Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2 sm:gap-4 relative z-10">
            <button 
              className="hidden sm:block text-sm font-bold text-slate-900 dark:text-white px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all duration-300"
              onClick={() => {
                const event = new CustomEvent('openLoginModal');
                window.dispatchEvent(event);
              }}
            >
              Sign In
            </button>
            
            {mounted ? (
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg p-2">
                  {/* Mobile Navigation Links */}
                  {navigationLinks.map((link, index) => {
                    const isHashLink = link.href.startsWith('#');
                    
                    if (isHashLink) {
                      return (
                        <DropdownMenuItem key={index} asChild>
                          <a
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer uppercase tracking-widest rounded-md"
                          >
                            {link.label}
                          </a>
                        </DropdownMenuItem>
                      );
                    }
                    
                    return (
                      <DropdownMenuItem key={index} asChild>
                        <Link
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer uppercase tracking-widest rounded-md"
                        >
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  
                  <div className="border-t border-gray-200 dark:border-gray-800 my-1" />
                  
                  {/* Mobile Action Buttons */}
                  <DropdownMenuItem asChild className="p-0">
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        const event = new CustomEvent('openLoginModal');
                        window.dispatchEvent(event);
                      }}
                      className="w-full text-sm font-bold text-slate-900 dark:text-white px-3 py-2.5 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-white/10 dark:hover:to-white/5 rounded-md transition-all duration-300 border border-slate-200 dark:border-white/20"
                    >
                      Sign In
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="p-0">
                    <Button 
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full rounded-full h-10 font-black shadow-lg shadow-primary/40 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:via-purple-500/90 hover:to-indigo-500/90 relative overflow-hidden group text-xs mt-1"
                    >
                      <span className="relative z-10">Enroll Now</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" />
              </button>
            )}
          </div>
        </nav>
      </header>
    );
  };


  export default Header;
