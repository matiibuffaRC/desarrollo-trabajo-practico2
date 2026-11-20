import { useEffect, useState } from "react";
import { ArrowUp } from "./Icons";

const prefersReduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Hace aparecer las tarjetas (y todo lo que tenga data-reveal) a medida que entran en pantalla.
// eslint-disable-next-line react-refresh/only-export-components
export function useScrollReveal() {
  useEffect(() => {
    const root = document.querySelector("main");
    if (!root || prefersReduced() || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("reveal-on");

    const io = new IntersectionObserver(
      (entries) => {
        let i = 0;
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const delay = Math.min(i, 6) * 70;
          i += 1;
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add("is-visible");
          io.unobserve(el);
          // Quita el retraso para que los hovers respondan al instante
          setTimeout(() => (el.style.transitionDelay = ""), 900 + delay);
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -30px 0px" }
    );

    const seen = new WeakSet();
    const scan = () =>
      root.querySelectorAll(".card:not(.is-visible), [data-reveal]:not(.is-visible)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      document.documentElement.classList.remove("reveal-on");
    };
  }, []);
}

// Progreso de scroll (0–1), posición y si se está bajando.
// eslint-disable-next-line react-refresh/only-export-components
export function useScroll() {
  const [state, setState] = useState({ progress: 0, y: 0, down: false });
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const delta = y - lastY;
      setState((s) => ({
        progress: max > 0 ? Math.min(1, y / max) : 0,
        y,
        // Tolerancia para que no "tiemble" con scrolls mínimos
        down: Math.abs(delta) < 6 ? s.down && y > 120 : delta > 0 && y > 120,
      }));
      lastY = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return state;
}

export function ScrollProgress({ progress }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]" aria-hidden="true">
      <div
        className="h-full origin-left bg-gradient-to-r from-brand-500 via-indigo-400 to-emerald-400"
        style={{ transform: `scaleX(${progress})`, transition: "transform 0.12s linear" }}
      />
    </div>
  );
}

export function BackToTop({ visible, navHidden }) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
      tabIndex={visible ? 0 : -1}
      className={`fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white shadow-xl transition-all duration-500 ease-[cubic-bezier(0.2,0.9,0.3,1.2)] md:bottom-8 md:right-8 md:hover:-translate-y-1 ${
        navHidden ? "bottom-6" : "bottom-28"
      } ${visible ? "scale-100 opacity-100" : "pointer-events-none scale-50 opacity-0"}`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
