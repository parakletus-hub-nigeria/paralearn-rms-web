"use client";
import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: "reveal" | "reveal-left" | "reveal-right";
  delay?: string;
}

export const ScrollReveal = ({
  children,
  className = "",
  animation = "reveal",
  delay = "0s",
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${animation} ${isVisible ? "active" : ""} ${className}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};
