import { useEffect, useRef, useState } from "react";
import { formatMoney } from "../../lib/finance";

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const ease = (t) => 1 - Math.pow(1 - t, 4);

// Cuenta desde el valor anterior (o desde 0 al montarse) hasta el valor nuevo.
function AnimatedNumber({ value, format = formatMoney, duration = 1100, className = "" }) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(() => (reduced() ? target : 0));
  const fromRef = useRef(display);
  const frame = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    if (reduced()) {
      fromRef.current = target;
      frame.current = requestAnimationFrame(() => setDisplay(target));
      return () => cancelAnimationFrame(frame.current);
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = t === 1 ? target : from + (target - from) * ease(t);
      fromRef.current = v;
      setDisplay(v);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return <span className={className}>{format(display)}</span>;
}

export default AnimatedNumber;
