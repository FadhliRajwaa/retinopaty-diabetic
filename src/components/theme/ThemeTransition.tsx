"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";

interface ThemeTransitionProps {
  children: React.ReactNode;
}

export function ThemeTransition({ children }: ThemeTransitionProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const isDark = (theme ?? resolvedTheme) === "dark" || resolvedTheme === "dark";

  // Smooth theme transition animations
  const backgroundSpring = useSpring({
    background: isDark 
      ? "linear-gradient(135deg, #222831 0%, #393E46 50%, #222831 100%)"
      : "linear-gradient(135deg, #EEEEEE 0%, #ffffff 50%, #EEEEEE 100%)",
    config: { tension: 120, friction: 20 }
  });

  const overlaySpring = useSpring({
    opacity: isDark ? 0.05 : 0.02,
    background: isDark ? "#00ADB5" : "#393E46",
    config: { tension: 100, friction: 25 }
  });

  if (!mounted) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <animated.div 
      style={backgroundSpring}
      className="min-h-screen relative transition-all duration-700 ease-in-out"
    >
      {/* Animated overlay for theme transitions */}
      <animated.div
        style={overlaySpring}
        className="fixed inset-0 pointer-events-none z-0"
      />
      
      {/* Content with smooth color transitions */}
      <div className="relative z-10 transition-colors duration-500 ease-in-out">
        {children}
      </div>
    </animated.div>
  );
}
