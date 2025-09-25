"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScrollReveal({ 
  children, 
  direction = "up", 
  delay = 0, 
  duration = 0.6,
  className = ""
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform values based on scroll
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const directionVariants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 }
  };

  const visibleVariant = {
    y: 0,
    x: 0,
    opacity: 1
  };

  return (
    <motion.div
      ref={ref}
      initial={directionVariants[direction]}
      animate={isInView ? visibleVariant : directionVariants[direction]}
      transition={{
        duration,
        delay,
        type: "spring",
        stiffness: 100,
        damping: 12
      }}
      style={{ y: direction === "up" || direction === "down" ? y : 0 }}
      className={className}
    >
      <motion.div style={{ opacity }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
