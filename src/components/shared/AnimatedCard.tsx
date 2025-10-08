"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  hover?: boolean;
}

export default function AnimatedCard({ 
  children, 
  delay = 0, 
  className = "", 
  hover = true 
}: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -5,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        transition: { duration: 0.2 }
      } : {}}
    >
      {children}
    </motion.div>
  );
}
