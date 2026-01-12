import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "../../images/IMG-20201027-WA0000_2-removebg-preview 1.png";
const Header = () => {
  return (
    <header className="w-full py-4 px-6 md:px-12 lg:px-20">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <Image
          src={logo}
          className="w-[50px] h-[50px] object-contain"
          alt="paralearn logo"
        />

        <div className="flex items-center gap-6">
          <a
            href="#contact"
            className="hidden sm:block text-sm font-medium text-hero-accent hover:text-hero transition-colors"
          >
            Contact Us
          </a>
          <a
            href="#started"
            className="hidden sm:block text-sm font-medium text-hero-accent hover:text-hero transition-colors"
          >
            Get Started
          </a>
          <Button size="sm" className="rounded-md px-6 font-medium">
            Get Started
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
