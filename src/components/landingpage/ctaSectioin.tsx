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
      <div className="w-full px-6 md:px-12 lg:px-24 py-24 md:py-40 overflow-hidden relative">
         {/* Enhanced Background flares */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/15 via-purple-500/10 to-indigo-500/15 blur-[140px] rounded-full pointer-events-none animate-float-slow" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-primary/15 blur-[140px] rounded-full pointer-events-none animate-float-slower" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-primary/10 via-purple-500/8 to-indigo-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
         
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-6">
            Ready to modernize your school's result management?
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium mb-8">
            Join the forward-thinking schools that have already moved from chaos to calm.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="h-16 px-12 rounded-2xl text-lg font-black shadow-2xl shadow-primary/40 hover:-translate-y-1 hover:shadow-primary/60 transition-all duration-300 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:via-purple-500/90 hover:to-indigo-500/90 relative overflow-hidden group"
            >
              <span className="relative z-10">Start Your School's Registration</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-16 px-8 text-lg font-bold hover:text-primary"
            >
              Still have questions? Contact Our Support Team
            </Button>
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
