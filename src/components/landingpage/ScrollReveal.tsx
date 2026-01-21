"use client";
import React, { useEffect, useRef, useState } from "react";

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
    observeForReveal(el, () => setIsVisible(true));
    return () => unobserveForReveal(el);
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
