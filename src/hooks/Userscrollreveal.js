import { useEffect } from "react";

// Adds .revealed class to elements with .reveal / .reveal-left / .reveal-right / .reveal-scale
// when they enter the viewport. Works with CSS transitions defined in globals.css.

export default function useScrollReveal(deps = []) {
  useEffect(() => {
    const selectors = ".reveal, .reveal-left, .reveal-right, .reveal-scale";
    const elements = document.querySelectorAll(selectors);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, deps);
}