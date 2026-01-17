"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: "reveal" | "reveal-left" | "reveal-right" | "reveal-up" | "reveal-down";
  delay?: string;
}

export const ScrollReveal = ({ 
  children, 
  animation = "reveal",
  delay = "0s" 
}: ScrollRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  const getAnimationClass = () => {
    if (!isVisible) {
      switch (animation) {
        case "reveal-left":
          return "opacity-0 translate-x-[-50px]";
        case "reveal-right":
          return "opacity-0 translate-x-[50px]";
        case "reveal-up":
          return "opacity-0 translate-y-[-50px]";
        case "reveal-down":
          return "opacity-0 translate-y-[50px]";
        default:
          return "opacity-0 translate-y-[30px]";
      }
    }
    return "opacity-100 translate-x-0 translate-y-0";
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ease-out ${getAnimationClass()}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};
