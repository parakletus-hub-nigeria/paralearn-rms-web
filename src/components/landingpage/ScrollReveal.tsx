"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

/* Shared IntersectionObserver: one observer for all ScrollReveal instances to avoid
   N observers and keep scroll/performance smooth. */

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  threshold: 0.08,
  rootMargin: "0px 0px -24px 0px",
};

const callbackMap = new WeakMap<Element, () => void>();
let sharedObserver: IntersectionObserver | null = null;

function getObserver() {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const fn = callbackMap.get(entry.target);
        if (fn) {
          fn();
          sharedObserver?.unobserve(entry.target);
          callbackMap.delete(entry.target);
        }
      }
    }, OBSERVER_OPTIONS);
  }
  return sharedObserver;
}

function observeForReveal(el: Element | null, onVisible: () => void) {
  if (!el) return;
  callbackMap.set(el, onVisible);
  getObserver().observe(el);
}

function unobserveForReveal(el: Element | null) {
  if (!el) return;
  sharedObserver?.unobserve(el);
  callbackMap.delete(el);
}

/* --- */

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
    const el = elementRef.current;
    if (!el) return;
    observeForReveal(el, () => setIsVisible(true));
    return () => unobserveForReveal(el);
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
