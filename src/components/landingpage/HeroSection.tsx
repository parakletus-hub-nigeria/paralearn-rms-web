import { Button } from "@/components/ui/button";
import AfricaGlobe from "./AfricaGlobe";

const HeroSection = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-20 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Main headline */}
        <div className="text-center mb-16 md:mb-24">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-hero italic leading-tight animate-fade-in">
            Empowering Educators,
          </h1>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-hero font-semibold mt-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Engaging Learners.
          </h2>
        </div>

        {/* Content section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left content */}
          <div className="max-w-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-foreground/80 font-body text-base md:text-lg leading-relaxed mb-8">
              Paralearn LMS is an intuitive, feature-packed learning platform crafted to simplify and enhance the educational experience across Africa
            </p>
            <Button 
              size="lg" 
              className="rounded-full px-8 font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Enroll your school
            </Button>
          </div>

          {/* Right illustration */}
          <div className="flex-shrink-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <AfricaGlobe />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
