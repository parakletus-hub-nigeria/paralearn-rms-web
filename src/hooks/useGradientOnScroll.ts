"use client";

import { useEffect, useState } from "react";

export const useGradientOnScroll = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollPosition(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Create a static gradient from purple to white that's always visible
  const gradientStyle = {
    backgroundImage: `linear-gradient(to bottom, rgb(219, 191, 234) 0%, rgb(219, 191, 234) 50%, rgba(219, 191, 234, 0.5) 75%, rgb(255, 255, 255) 100%)`,
  };

  return { gradientStyle, scrollPosition };
};
