"use client";

import { motion } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import { useState } from "react";

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  glowColor?: string;
}

export function InteractiveCard({ 
  children, 
  className = "", 
  hoverScale = 1.02,
  glowColor = "#00ADB5"
}: InteractiveCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const springProps = useSpring({
    transform: isHovered ? `scale(${hoverScale})` : 'scale(1)',
    boxShadow: isHovered 
      ? `0 20px 40px -10px ${glowColor}20, 0 0 0 1px ${glowColor}30`
      : '0 8px 30px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1)',
    config: { tension: 300, friction: 25 }
  });

  return (
    <animated.div
      style={springProps}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="h-full"
      >
        {children}
      </motion.div>
      
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 opacity-0 pointer-events-none"
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(circle at center, ${glowColor}40, transparent 60%)`
        }}
      />
    </animated.div>
  );
}
