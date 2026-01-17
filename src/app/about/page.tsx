"use client";

import Header from "@/components/landingpage/Header";
import { GradientSection } from "@/components/GradientSection";
import AboutPage from "@/components/landingpage/AboutPage";

export default function About() {
  return (
    <GradientSection className="min-h-screen">
      <Header />
      <main>
        <AboutPage />
      </main>
    </GradientSection>
  );
}
