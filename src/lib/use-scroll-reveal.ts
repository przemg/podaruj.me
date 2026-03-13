"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement>(
  options: { threshold?: number; staggerDelay?: number } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      const children = element.querySelectorAll(
        ".scroll-reveal, .scroll-reveal-right, .scroll-reveal-scale"
      );
      children.forEach((child) => {
        child.classList.add("revealed");
      });
      if (
        element.classList.contains("scroll-reveal") ||
        element.classList.contains("scroll-reveal-right") ||
        element.classList.contains("scroll-reveal-scale")
      ) {
        element.classList.add("revealed");
      }
      return;
    }

    const { threshold = 0.15, staggerDelay = 100 } = options;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;

            const children = target.querySelectorAll(
              ".scroll-reveal, .scroll-reveal-right, .scroll-reveal-scale"
            );

            if (children.length > 0) {
              children.forEach((child, index) => {
                setTimeout(() => {
                  child.classList.add("revealed");
                }, index * staggerDelay);
              });
            }

            if (
              target.classList.contains("scroll-reveal") ||
              target.classList.contains("scroll-reveal-right") ||
              target.classList.contains("scroll-reveal-scale")
            ) {
              target.classList.add("revealed");
            }

            observer.unobserve(target);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options.threshold, options.staggerDelay]);

  return ref;
}
