"use client";

import HeroSection from "./HeroSection";
import Header from "./Header";
import ComparisonSection from "./ComparisonSection";
import BenefitsSection from "./BenefitsSection";
import HowItWorksSection from "./HowItWorksSection";
import CTASection from "./CTASection";
import Footer from "./Footer";
import LoginModal from "./LoginModal";
import { GradientSection } from "@/components/GradientSection";

import { ScrollReveal } from "./ScrollReveal";

const LandingPage = () => {
  return (
    <GradientSection className="min-h-screen">
      <Header />
      <LoginModal />
      <main>
        <ScrollReveal animation="reveal" delay="0.1s">
          <HeroSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <ComparisonSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <BenefitsSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <HowItWorksSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <CTASection />
        </ScrollReveal>
      </main>
      <Footer />
    </GradientSection>
  );
};


export default LandingPage;
