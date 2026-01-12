import HeroSection from "./HeroSection";
import Header from "./Header";
import SchoolSuiteSection from "./schoolSuiteSection";
import CBTSection from "./CBTSection";
import WhatIsParalearnSection from "./WhatIsParalearnSection";
import ManagementSection from "./ManagementSection";
import SchedulingSection from "./SchedulingSection";
const LandingPage = () => {
  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      <main>
        <HeroSection />
        <SchoolSuiteSection />
        <ManagementSection />
        <SchedulingSection />
        <CBTSection />
        <WhatIsParalearnSection />
      </main>
    </div>
  );
};

export default LandingPage;
