import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useReveal() {
  const location = useLocation();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".reveal-section"));

    // Stop early if there are no reveal sections.
    if (!elements.length) return;

    // Reset state on route change so animation can run again.
    elements.forEach((el) => {
      el.classList.remove("is-visible");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // Reveal once per route visit.
          }
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    elements.forEach((el) => observer.observe(el));

    // Clean up observer on route change/unmount.
    return () => observer.disconnect();
  }, [location.pathname]);
}
