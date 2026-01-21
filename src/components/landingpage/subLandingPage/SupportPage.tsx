"use client";

import { useEffect } from "react";
import { LandingLayout } from "../LandingLayout";

export default function SupportPage() {
  useEffect(() => {
    const phoneNumber = "2348148876125";
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  }, []);

  return (
    <LandingLayout className="min-h-screen">
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
              We&apos;re opening WhatsApp for you. If it doesn&apos;t open automatically, please click{" "}
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
    </LandingLayout>
  );
}
