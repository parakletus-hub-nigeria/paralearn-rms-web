"use client";

import Header from "./Header";
import Footer from "./Footer";
import { GradientSection } from "@/components/GradientSection";

interface LandingLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function LandingLayout({ children, className }: LandingLayoutProps) {
  return (
    <GradientSection className={className ?? "min-h-screen"}>
      <Header />
      <main className="pt-24 pb-12">{children}</main>
      <Footer />
    </GradientSection>
  );
}
