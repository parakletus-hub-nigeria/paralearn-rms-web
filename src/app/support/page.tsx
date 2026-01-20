"use client";

import { useEffect } from "react";
import Header from "@/components/landingpage/Header";
import { GradientSection } from "@/components/GradientSection";
import Footer from "@/components/landingpage/Footer";

export default function Support() {
  useEffect(() => {
    // WhatsApp number from Footer - remove all spaces and special characters
    const phoneNumber = "2348148876125"; // Nigeria format without + sign
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    
    // Automatically open WhatsApp
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    
    // Redirect to home after a short delay
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  }, []);

  return (
    <GradientSection className="min-h-screen">
      <Header />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Contact Support
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Opening WhatsApp...
            </p>
          </div>
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We're opening WhatsApp for you. If it doesn't open automatically, please click{" "}
                <a 
                  href="https://wa.me/2348148876125" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-bold"
                >
                  here
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </GradientSection>
  );
}
