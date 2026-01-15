import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "../../images/IMG-20201027-WA0000_2-removebg-preview 1.png";
const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-300">
      <nav className="max-w-7xl mx-auto h-20 px-8 glass-card rounded-full flex items-center justify-between border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] relative overflow-hidden">
        {/* Intrinsic Scroll Progress Bar for Floating Header */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-150 ease-out z-50 overflow-hidden w-full">
           <div 
             className="h-full bg-gradient-to-r from-primary via-purple-500 to-indigo-600" 
             id="floating-scroll-progress"
             style={{ width: '0%' }}
           />
        </div>

        <div className="flex items-center gap-3 group cursor-pointer">
           <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-all" />
              <Image
                src={logo}
                className="w-[45px] h-[45px] object-contain relative z-10 transition-transform group-hover:scale-110"
                alt="paralearn logo"
              />
           </div>
           <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">PARALEARN</span>
        </div>

        <div className="flex items-center gap-8 md:gap-12">
          <div className="hidden lg:flex items-center gap-8">
            <a href="#products" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-all uppercase tracking-widest">Products</a>
            <a href="#school" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-all uppercase tracking-widest">For Schools</a>
            <a href="#about" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-all uppercase tracking-widest">About</a>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="hidden sm:block text-sm font-bold text-slate-900 dark:text-white px-6 py-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/20">
                Sign In
             </button>
             <Button className="rounded-full px-10 h-12 font-black shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all">
               Enroll Now
             </Button>
          </div>
        </div>
      </nav>

      {/* Script for Floating Header Morph & Scroll Progress */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('scroll', () => {
          const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
          const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrolled = (winScroll / height) * 100;
          
          const progressBar = document.getElementById('floating-scroll-progress');
          if (progressBar) progressBar.style.width = scrolled + '%';
          
          const header = document.querySelector('header');
          if (winScroll > 50) {
            header.classList.add('py-2');
            header.classList.remove('py-4');
          } else {
            header.classList.add('py-4');
            header.classList.remove('py-2');
          }
        });
      `}} />
    </header>
  );
};


export default Header;
