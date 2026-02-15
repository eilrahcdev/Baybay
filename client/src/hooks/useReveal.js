import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useReveal() {
  const location = useLocation();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".reveal-section"));

    // If no reveal sections, nothing to do
    if (!elements.length) return;

    // Reset reveal state when navigating so sections can animate again
    elements.forEach((el) => {
      el.classList.remove("is-visible");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // reveal once per navigation
          }
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    elements.forEach((el) => observer.observe(el));

    // Cleanup when route changes/unmounts
    return () => observer.disconnect();
  }, [location.pathname]);
}
