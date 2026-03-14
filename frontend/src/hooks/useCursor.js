import { useEffect } from 'react';

export function useCursor() {
  useEffect(() => {
    // Only run on desktop/non-touch devices
    if ('ontouchstart' in window) return;

    const dot = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    let mx = 0, my = 0, rx = 0, ry = 0;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };
    
    document.addEventListener('mousemove', onMove, { passive: true });

    let raf;
    const loop = () => {
      // Lerp (Lag) for ring
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;

      if (dot) {
        dot.style.left = `${mx}px`;
        dot.style.top = `${my}px`;
      }
      if (ring) {
        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
}
