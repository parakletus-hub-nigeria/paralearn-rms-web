"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Facebook,
  MapPin,
  Phone,
  School,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import logo from "../../images/IMG-20201027-WA0000_2-removebg-preview 1.png";

const CTASection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted email:", email);
    setEmail("");
  };

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "For Schools", href: "#schools" },
      { label: "CBT System", href: "#cbt" },
    ],
    company: [
      { label: "About Us", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Blog", href: "#blog" },
      { label: "Partners", href: "#partners" },
    ],
    resources: [
      { label: "Documentation", href: "#docs" },
      { label: "Help Center", href: "#help" },
      { label: "Contact Support", href: "#support" },
      { label: "Community", href: "#community" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Security", href: "#security" },
      { label: "Cookie Policy", href: "#cookies" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <div className="w-full text-slate-900 dark:text-white selection:bg-primary selection:text-white">
      {/* Final CTA Section */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-20 md:py-32 lg:py-40 overflow-hidden relative bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-900">
         {/* Enhanced Background flares */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] bg-gradient-to-br from-primary/20 via-purple-500/15 to-indigo-500/20 blur-[140px] rounded-full pointer-events-none opacity-60" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-primary/20 blur-[140px] rounded-full pointer-events-none opacity-60" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-gradient-to-r from-primary/15 via-purple-500/12 to-indigo-500/15 blur-[100px] rounded-full pointer-events-none animate-pulse" />
         
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {/* Badge */}
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-600/10 border border-primary/20 dark:border-primary/30">
            <span className="text-xs sm:text-sm font-bold text-primary dark:text-purple-400 uppercase tracking-widest">
              Get Started Today
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-4 md:mb-6 px-4">
            Ready to modernize your{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                school's result management
              </span>
              <span className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-primary/20 via-purple-600/30 to-indigo-600/20 rounded-full blur-sm" />
            </span>
            ?
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl text-slate-600 dark:text-slate-400 font-medium mb-8 md:mb-12 max-w-3xl mx-auto px-4 leading-relaxed">
            Join the forward-thinking schools that have already moved from chaos to calm.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 px-4">
            <Button 
              size="lg"
              onClick={() => {
                window.location.href = "/auth/signup";
              }}
              className="h-14 sm:h-16 md:h-20 px-8 sm:px-10 md:px-14 rounded-2xl text-base sm:text-lg md:text-xl font-black shadow-2xl shadow-primary/50 hover:-translate-y-1 hover:shadow-primary/70 transition-all duration-300 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:via-purple-500/90 hover:to-indigo-500/90 relative overflow-hidden group w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Your School's Registration
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-14 sm:h-16 md:h-20 px-6 sm:px-8 md:px-10 text-base sm:text-lg md:text-xl font-bold hover:text-primary dark:hover:text-purple-400 border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-purple-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 w-full sm:w-auto"
            >
              Still have questions? Contact Our Support Team
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 md:mt-16 pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Trusted by 500+ Schools</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span>24/7 Support Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '1s' }} />
                <span>Free Setup & Migration</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <footer className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-t border-slate-200 dark:border-slate-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgb(100,27,196)_1px,transparent_0)] bg-[length:24px_24px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-20">
          {/* Newsletter Section */}
          <div className="mb-16 md:mb-20">
            <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-indigo-500/10 dark:from-primary/20 dark:via-purple-500/20 dark:to-indigo-500/20 rounded-3xl p-8 md:p-12 border border-primary/20 dark:border-primary/30 shadow-xl">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                    <Mail className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                      Stay in the <span className="text-primary italic">loop</span>
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">
                    Get the latest updates, tips, and exclusive content delivered to your inbox.
                  </p>
                </div>
                <form 
                  onSubmit={handleSubmit} 
                  className="flex-1 w-full lg:max-w-md flex gap-3"
                >
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-12 md:h-14 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-primary rounded-full px-6 text-base font-medium"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 md:h-14 px-6 md:px-8 rounded-full bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:via-purple-500/90 hover:to-indigo-500/90 font-black shadow-lg shadow-primary/30"
                  >
                    <span className="hidden sm:inline">Subscribe</span>
                    <ArrowRight className="w-5 h-5 sm:hidden" />
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 lg:col-span-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 md:w-12 md:h-12">
                  <Image
                    src={logo}
                    alt="ParaLearn Logo"
                    className="object-contain"
                    fill
                  />
                </div>
                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  PARA<span className="text-primary">LEARN</span>
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-xs">
                Empowering African schools with modern result management solutions. From chaos to calm.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Lagos, Nigeria
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href="tel:+234123456789" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    +234 123 456 789
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href="mailto:hello@paralearn.com" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    hello@paralearn.com
                  </a>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                Product
              </h4>
              <nav className="flex flex-col gap-3">
                {footerLinks.product.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                Company
              </h4>
              <nav className="flex flex-col gap-3">
                {footerLinks.company.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Resources Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                Resources
              </h4>
              <nav className="flex flex-col gap-3">
                {footerLinks.resources.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Legal Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                Legal
              </h4>
              <nav className="flex flex-col gap-3">
                {footerLinks.legal.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  © {new Date().getFullYear()} ParaLearn. All rights reserved.
                </p>
                <span className="hidden md:inline text-slate-400">•</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Proudly built for <span className="text-primary font-black">Africa</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  System Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default CTASection;
