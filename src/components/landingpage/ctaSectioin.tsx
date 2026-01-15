"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CTASection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted email:", email);
    setEmail("");
  };

  return (
    <div className="w-full text-slate-900 dark:text-white selection:bg-primary selection:text-white">
      {/* Hero Section */}
      <div className="w-full px-6 md:px-12 lg:px-24 py-24 md:py-60 overflow-hidden relative">
         {/* Enhanced Background flares */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/15 via-purple-500/10 to-indigo-500/15 blur-[140px] rounded-full pointer-events-none animate-float-slow" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-primary/15 blur-[140px] rounded-full pointer-events-none animate-float-slower" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-primary/10 via-purple-500/8 to-indigo-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
         
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16 lg:gap-32">
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.9] tracking-tighter drop-shadow-2xl">
              Ready to <br />
              <span className="text-hero italic drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-indigo-600 animate-gradient-x">dive in?</span>
            </h1>
            <div className="space-y-12 group max-w-xl">
               <p className="text-2xl md:text-4xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  Start your free trial today and <span className="text-primary italic font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">join the future</span> of African education.
               </p>
               <Button className="h-24 px-16 rounded-[2rem] bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white hover:from-primary/90 hover:via-purple-500/90 hover:to-indigo-500/90 transition-all text-2xl font-black shadow-[0_30px_60px_-15px_rgba(100,27,196,0.5)] group-hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_40px_80px_-15px_rgba(100,27,196,0.6)] relative overflow-hidden">
                 <span className="relative z-10">Get Started Now</span>
                 <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter + Footer Section */}
      <div className="px-6 pb-24 md:pb-40 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="max-w-7xl mx-auto">
          <div className="relative glass-card rounded-[3rem] p-12 md:p-24 overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/30 transition-all duration-1000" />
            
            <div className="relative flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
              {/* Newsletter Form */}
              <div className="flex-1 w-full space-y-8">
                <div className="space-y-4">
                   <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                     Stay in the <span className="text-primary italic">loop.</span>
                   </h2>
                   <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Subscribe to our newsletter for the latest updates.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 p-2 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent border-0 h-16 px-6 text-lg focus-visible:ring-0 placeholder:text-slate-500 dark:placeholder:text-slate-600 font-bold text-slate-900 dark:text-white"
                  />
                  <Button
                    type="submit"
                    className="h-16 px-10 rounded-2xl bg-primary text-white font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30"
                  >
                    Subscribe
                  </Button>
                </form>
              </div>

              {/* Footer Links & Social */}
              <div className="flex-1 w-full space-y-12">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                   <div className="space-y-6">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Company</p>
                      <nav className="flex flex-col gap-4">
                         <a href="#" className="font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">About Us</a>
                         <a href="#" className="font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Careers</a>
                         <a href="#" className="font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Partners</a>
                      </nav>
                   </div>
                   <div className="space-y-6">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Legal</p>
                      <nav className="flex flex-col gap-4">
                         <a href="#" className="font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Privacy</a>
                         <a href="#" className="font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Terms</a>
                         <a href="#" className="font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Security</a>
                      </nav>
                   </div>
                   <div className="space-y-6 hidden md:block">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Social</p>
                      <div className="flex gap-4">
                         <a href="#" className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white hover:-translate-y-1 transition-all border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-400">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                         </a>
                         <a href="#" className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white hover:-translate-y-1 transition-all border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-400">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0.013-3.583 0.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-0.057 1.645-0.069 4.849-0.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259 0.014 3.668 0.072 4.948 0.2 4.358 2.618 6.78 6.98 6.98 1.281 0.058 1.689 0.072 4.948 0.072 3.259 0 3.668-0.014 4.948-0.072 4.354-0.2 6.782-2.618 6.979-6.98 0.059-1.28 0.073-1.689 0.073-4.948 0-3.259-0.014-3.667-0.072-4.947-0.196-4.354-2.617-6.78-6.979-6.98-1.281-0.059-1.69-0.073-4.949-0.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-0.796 0-1.441.645-1.441 1.44s0.645 1.44 1.441 1.44c0.795 0 1.439-0.645 1.439-1.44s-0.644-1.44-1.439-1.44z" /></svg>
                         </a>
                      </div>
                   </div>
                </div>
                
                <div className="pt-12 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                   <p className="text-slate-500 dark:text-slate-500 font-bold text-sm">© 2024 ParaKletus Inc. Proudly built for Africa.</p>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">System Live</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};


export default CTASection;
