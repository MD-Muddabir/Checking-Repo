import { useEffect } from 'react';

export function useScrollReveal(className = 'reveal', threshold = 0.1) {
  useEffect(() => {
    const els = document.querySelectorAll(`.${className}`);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold });

    els.forEach(el => observer.observe(el));

    // Progress bar cleanup is optional but handled in LandingPage for clarity,
    // so we can just leave this hook to manage the reveal logic.
    return () => observer.disconnect();
  }, [className, threshold]);
}
