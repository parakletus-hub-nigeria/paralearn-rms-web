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
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import logo from "../../../public/log.png";
import ComingSoonModal from "./ComingSoonModal";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState("Coming Soon");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted email:", email);
    setEmail("");
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) => {
    // Contact Support opens WhatsApp
    if (href === "/support") {
      e.preventDefault();
      const phoneNumber = "2348148876125";
      const whatsappUrl = `https://wa.me/${phoneNumber}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }
    
    // About Us and Contact go to their pages
    if (href === "/about" || href === "/contact") {
      return; // Allow normal navigation
    }
    
    // All other links show coming soon modal
    e.preventDefault();
    setComingSoonTitle(label);
    setComingSoonOpen(true);
  };

  const handleComingSoonOpenChange = (open: boolean) => {
    setComingSoonOpen(open);
    if (!open) {
      // When closing (Got it, overlay, or ESC), scroll back to footer at bottom
      setTimeout(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" }), 0);
    }
  };

  const footerLinks = {
    product: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/contact" },
      // { label: "For Schools", href: "#schools" },
      // { label: "CBT System", href: "#cbt" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Partners", href: "/partners" },
    ],
    resources: [
      { label: "Documentation", href: "/documentation" },
      { label: "Help Center", href: "/help" },
      { label: "Contact Support", href: "/support" },
      // { label: "Community", href: "#community" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://x.com/paralearn?t=3ViWKpFjN_J4apAcsrzu0Q&s=09", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/paralearn.io?igsh=Nzh5eXRpdHhtcHU5", label: "Instagram" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/paralearn/", label: "LinkedIn" },
  ];

  return (
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 md:gap-10 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1 space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4 -mt-8 -mb-8 md:-mt-10 md:-mb-10">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 bg-transparent">
                <Image
                  src={logo}
                  alt="ParaLearn Logo"
                  className="object-contain"
                  fill
                />
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-xs md:max-w-sm">
              Empowering African schools with modern result management solutions. From chaos to calm.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  PortHarcourt, Rivers State
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <a href="tel:+2348148876125" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                +234 814887 6125
                </a>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <a href="mailto:hello@paralearn.com" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors break-all">
                  paralearn.io@gmail.com
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 md:gap-3 pt-2">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                const isExternal = social.href.startsWith('http');
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
              Product
            </h4>
            <nav className="flex flex-col gap-2 md:gap-3">
              {footerLinks.product.map((link, index) => {
                const isExternal = link.href.startsWith('http');
                const isHash = link.href.startsWith('#');
                if (isExternal || isHash) {
                  return (
                    <a
                      key={index}
                      href={link.href}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium"
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </a>
                  );
                }
                return (
                  <a
                    key={index}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href, link.label)}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium cursor-pointer"
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Company Links */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
              Company
            </h4>
            <nav className="flex flex-col gap-2 md:gap-3">
              {footerLinks.company.map((link, index) => {
                const isExternal = link.href.startsWith('http');
                const isHash = link.href.startsWith('#');
                if (isExternal || isHash) {
                  return (
                    <a
                      key={index}
                      href={link.href}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium"
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </a>
                  );
                }
                return (
                  <a
                    key={index}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href, link.label)}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium cursor-pointer"
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Resources Links */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
              Resources
            </h4>
            <nav className="flex flex-col gap-2 md:gap-3">
              {footerLinks.resources.map((link, index) => {
                const isExternal = link.href.startsWith('http');
                const isHash = link.href.startsWith('#');
                if (isExternal || isHash) {
                  return (
                    <a
                      key={index}
                      href={link.href}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium"
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </a>
                  );
                }
                return (
                  <a
                    key={index}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href, link.label)}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium cursor-pointer"
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Legal Links */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
              Legal
            </h4>
            <nav className="flex flex-col gap-2 md:gap-3">
              {footerLinks.legal.map((link, index) => {
                const isExternal = link.href.startsWith('http');
                const isHash = link.href.startsWith('#');
                if (isExternal || isHash) {
                  return (
                    <a
                      key={index}
                      href={link.href}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium"
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </a>
                  );
                }
                return (
                  <a
                    key={index}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href, link.label)}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium cursor-pointer"
                  >
                    {link.label}
                  </a>
                );
              })}
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
      <ComingSoonModal 
        open={comingSoonOpen} 
        onOpenChange={handleComingSoonOpenChange}
        title={comingSoonTitle}
      />
    </footer>
  );
};

export default Footer;
