"use client";

import Header from "@/components/landingpage/Header";
import { GradientSection } from "@/components/GradientSection";
import ContactPage from "@/components/landingpage/ContactPage";

export default function Contact() {
  return (
    <GradientSection className="min-h-screen">
      <Header />
      <main>
        <ContactPage />
      </main>
    </GradientSection>
  );
}
