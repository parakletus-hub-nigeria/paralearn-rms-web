  "use client";

  import { Button } from "@/components/ui/button";
  import Link from "next/link";
  import Image from "next/image";
  import logo from "../../../public/mainLogo.svg";

  import { useEffect, useState } from "react";
  import { usePathname } from "next/navigation";
  import { Menu } from "lucide-react";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

  const Header = () => {
    const pathname = usePathname();
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
      
      const handleScroll = () => {
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
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, mounted]);

    const navigationLinks = [
      { label: "Product", href: "/product" },
      // { label: "For Schools", href: "#school" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ];

    return (
      <header 
        className={`fixed top-0 left-0 w-full z-50 px-0 sm:px-1 md:px-2 py-2 sm:py-2.5 md:py-3 bg-transparent transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <nav className="max-w-7xl mx-auto h-14 sm:h-14 md:h-16 pl-0 sm:pl-1 md:pl-2 pr-4 sm:pr-6 md:pr-8 bg-white rounded-full flex items-center justify-between border border-gray-200/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
          {/* Enhanced Scroll Progress Bar */}
          <div className="absolute bottom-0 left-0 h-[2px] sm:h-[3px] bg-slate-200/50 dark:bg-slate-800/50 transition-all duration-150 ease-out z-50 overflow-hidden w-full rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-primary via-purple-500 to-indigo-600 shadow-lg shadow-primary/50 transition-all duration-300 ease-out" 
              style={{ width: `${scrolled}%` }}
            />
          </div>

          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

          <div className="flex items-center gap-1 sm:gap-2 group cursor-pointer relative z-10 shrink-0">
            <Link href="/" className="relative block h-14 sm:h-12 md:h-14 lg:h-16 aspect-[930/479] bg-transparent">
              <Image
                src={logo}
                fill
                className="object-contain object-left"
                alt="paralearn logo"
                priority
                sizes="(max-width: 640px) 240px, (max-width: 768px) 220px, (max-width: 1024px) 260px, 320px"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 md:gap-12 relative z-10">
            <div className="flex items-center gap-8">
              {navigationLinks.map((link, index) => {
                const isHashLink = link.href.startsWith('#');
                const isActive = pathname === link.href;
                
                if (isHashLink) {
                  return (
                    <a
                      key={index}
                      href={link.href}
                      className={`header-nav-link text-sm font-bold transition-all uppercase tracking-widest relative focus:outline-none px-4 py-2 rounded-lg ${
                        isActive 
                          ? 'text-primary bg-primary/10 dark:bg-primary/20' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {link.label}
                    </a>
                  );
                }
                
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className={`header-nav-link text-sm font-bold transition-all uppercase tracking-widest relative focus:outline-none px-4 py-2 rounded-lg ${
                      isActive 
                        ? 'text-primary bg-primary/10 dark:bg-primary/20' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/auth/signin">
                <button 
                  className="text-sm font-bold text-slate-900 dark:text-white px-4 md:px-6 py-2 sm:py-2.5 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-white/10 dark:hover:to-white/5 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-white/20 hover:shadow-md"
                >
                    Sign In
                </button>
              </Link>
              <Link href="/auth/signup">
                <Button className="rounded-full px-6 md:px-10 h-10 sm:h-11 md:h-12 font-black shadow-md shadow-primary/30 bg-gradient-to-r from-primary via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-indigo-700 hover:to-primary text-xs sm:text-sm">
                  Enroll Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2 sm:gap-4 relative z-10">
            <Link href="/auth/signin" className="hidden sm:block">
              <button 
                className="text-sm font-bold text-slate-900 dark:text-white px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all duration-300"
              >
                Sign In
              </button>
            </Link>
            
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
                    const isActive = pathname === link.href;
                    
                    if (isHashLink) {
                      return (
                        <DropdownMenuItem key={index} asChild>
                          <a
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`px-3 py-2.5 text-sm font-bold cursor-pointer uppercase tracking-widest rounded-md ${
                              isActive 
                                ? 'text-primary bg-primary/10 dark:bg-primary/20' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-purple-50 dark:hover:bg-purple-900/20'
                            }`}
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
                          className={`px-3 py-2.5 text-sm font-bold cursor-pointer uppercase tracking-widest rounded-md ${
                            isActive 
                              ? 'text-primary bg-primary/10 dark:bg-primary/20' 
                              : 'text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-purple-50 dark:hover:bg-purple-900/20'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  
                  <div className="border-t border-gray-200 dark:border-gray-800 my-1" />
                  
                  {/* Mobile Action Buttons */}
                  <DropdownMenuItem asChild className="p-0">
                    <Link 
                      href="/auth/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full text-sm font-bold text-slate-900 dark:text-white px-3 py-2.5 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-white/10 dark:hover:to-white/5 rounded-md transition-all duration-300 border border-slate-200 dark:border-white/20 block text-center"
                    >
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="p-0">
                    <Link 
                      href="/auth/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full mt-1"
                    >
                      <Button 
                        className="w-full rounded-full h-10 font-black shadow-lg shadow-primary/40 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:via-purple-500/90 hover:to-indigo-500/90 relative overflow-hidden group text-xs"
                      >
                        <span className="relative z-10">Enroll Now</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      </Button>
                    </Link>
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
