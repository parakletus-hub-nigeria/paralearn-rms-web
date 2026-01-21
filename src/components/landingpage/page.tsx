"use client";

import HeroSection from "./HeroSection";
import Header from "./Header";
import ComparisonSection from "./ComparisonSection";
import BenefitsSection from "./BenefitsSection";
import HowItWorksSection from "./HowItWorksSection";
import CTASection from "./CTASection";
import Footer from "./Footer";
import LoginModal from "./LoginModal";
import WhatsAppFloat from "./WhatsAppFloat";
import { GradientSection } from "@/components/GradientSection";

const LandingPage = () => {
  return (
    <GradientSection className="min-h-screen">
      <Header />
      <LoginModal />
      <main>
        <HeroSection />
        <ComparisonSection />
        <BenefitsSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </GradientSection>
  );
};

export default LandingPage;
