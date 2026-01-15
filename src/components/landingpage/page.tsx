"use client";

import HeroSection from "./HeroSection";
import Header from "./Header";
import SchoolSuiteSection from "./schoolSuiteSection";
import CBTSection from "./CBTSection";
import WhatIsParalearnSection from "./WhatIsParalearnSection";
import ManagementSection from "./ManagementSection";
import SchedulingSection from "./SchedulingSection";
import WhatYouCanDo from "./WhatYouCanDo";
import FeaturesSection from "./featureSection";
import ToolsSection from "./toolsection";
import AssessmentsSection from "./assessmentSection";
import TrustedBySection from "./trustedBySection";
import CTASection from "./ctaSectioin";
import { GradientSection } from "@/components/GradientSection";

import { ScrollReveal } from "./ScrollReveal";

const LandingPage = () => {
  return (
    <GradientSection className="min-h-screen">
      <Header />
      <main>
        <ScrollReveal animation="reveal" delay="0.1s">
          <HeroSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <SchoolSuiteSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal-left">
          <ManagementSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal-right">
          <SchedulingSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <CBTSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <WhatIsParalearnSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <WhatYouCanDo />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <FeaturesSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <ToolsSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <AssessmentsSection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <TrustedBySection />
        </ScrollReveal>
        
        <ScrollReveal animation="reveal">
          <CTASection />
        </ScrollReveal>
      </main>
    </GradientSection>
  );
};


export default LandingPage;
