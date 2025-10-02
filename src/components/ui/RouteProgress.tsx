"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const doneRef = useRef<number | null>(null);

  useEffect(() => {
    // Start progress when pathname changes
    setVisible(true);
    setWidth(0);

    // Ramp up progress smoothly
    const steps = [20, 45, 70, 85];
    steps.forEach((w, i) => {
      window.setTimeout(() => setWidth(w), 100 + i * 120);
    });

    // Safety: if nothing finishes in 1.2s, keep it at 90%
    timeoutRef.current = window.setTimeout(() => setWidth(90), 800);

    // Finish a little after mount (lets Suspense/loaders kick in)
    doneRef.current = window.setTimeout(() => {
      setWidth(100);
      window.setTimeout(() => setVisible(false), 250);
    }, 900);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (doneRef.current) window.clearTimeout(doneRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] pointer-events-none">
      <div
        className="h-[3px] bg-[var(--accent)] shadow-[0_0_10px_rgba(0,173,181,0.6)] transition-[width] duration-200 ease-out"
        style={{ width: `${width}%` }}
      />
      {/* Subtle bottom glow */}
      <div className="h-[1px] bg-[var(--accent)]/20" />
    </div>
  );
}
