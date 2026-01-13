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

const LandingPage = () => {
  return (
    <GradientSection className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <SchoolSuiteSection />
        <ManagementSection />
        <SchedulingSection />
        <CBTSection />
        <WhatIsParalearnSection />
        <WhatYouCanDo />
        <FeaturesSection />
        <ToolsSection />
        <AssessmentsSection />
        <TrustedBySection />
        <CTASection />
      </main>
    </GradientSection>
  );
};

export default LandingPage;
