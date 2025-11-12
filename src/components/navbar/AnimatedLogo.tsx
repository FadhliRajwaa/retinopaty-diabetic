"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { Eye, Microscope, Brain, Stethoscope, Scan, HeartPulse } from "lucide-react";

const logoVariations = [
  { icon: Eye, label: "Retina", color: "#00ADB5" },
  { icon: Microscope, label: "Analysis", color: "#FF6B6B" },
  { icon: Brain, label: "AI", color: "#4ECDC4" },
  { icon: Stethoscope, label: "Medical", color: "#45B7D1" },
  { icon: Scan, label: "Scan", color: "#96CEB4" },
  { icon: HeartPulse, label: "Health", color: "#FFEAA7" }
];

export function AnimatedLogo() {
  const [selectedVariation, setSelectedVariation] = useState(logoVariations[0]);
  const [isHovered, setIsHovered] = useState(false);
  const { scrollY } = useScroll();
  
  // Scroll-based transformations
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.8]);
  const logoOpacity = useTransform(scrollY, [0, 50], [1, 0.9]);

  // Auto-cycle through variations
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedVariation(prev => {
        const currentIndex = logoVariations.findIndex(v => v.label === prev.label);
        const nextIndex = (currentIndex + 1) % logoVariations.length;
        return logoVariations[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const IconComponent = selectedVariation.icon;

  return (
    <motion.div 
      className="relative flex items-center space-x-3 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ scale: logoScale, opacity: logoOpacity }}
    >
      {/* Animated Icon Container */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-md"
          animate={{
            backgroundColor: isHovered ? `${selectedVariation.color}40` : 'rgba(0, 0, 0, 0)',
            scale: isHovered ? 1.5 : 1
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Icon container with gradient background */}
        <motion.div
          style={{
            background: `linear-gradient(135deg, ${selectedVariation.color}20, ${selectedVariation.color}10)`
          }}
          animate={{
            borderColor: selectedVariation.color,
            boxShadow: isHovered 
              ? `0 0 20px ${selectedVariation.color}40, 0 0 40px ${selectedVariation.color}20`
              : '0 0 0px transparent'
          }}
          transition={{ duration: 0.4 }}
          className="relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2"
        >
          {/* Animated icon with smooth transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedVariation.label}
              initial={{ 
                scale: 0,
                rotate: -180,
                opacity: 0
              }}
              animate={{ 
                scale: 1,
                rotate: 0,
                opacity: 1
              }}
              exit={{ 
                scale: 0,
                rotate: 180,
                opacity: 0
              }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.6
              }}
            >
              <IconComponent 
                className="w-5 h-5 transition-all duration-300"
                style={{ color: selectedVariation.color }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Rotating ring effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed opacity-30"
            style={{ borderColor: selectedVariation.color }}
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Pulsing particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ 
                backgroundColor: selectedVariation.color,
                top: '50%',
                left: '50%'
              }}
              animate={{
                scale: [0, 1, 0],
                x: [0, Math.cos(i * 120 * Math.PI / 180) * 20],
                y: [0, Math.sin(i * 120 * Math.PI / 180) * 20],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Animated Text */}
      <motion.div className="flex flex-col">
        <motion.span 
          className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#00ADB5] to-[#393E46] bg-clip-text text-transparent"
          animate={{
            backgroundPosition: isHovered ? "200% center" : "0% center"
          }}
          transition={{ duration: 0.8 }}
          style={{
            backgroundSize: "200% 100%"
          }}
        >
          RetinaAI
        </motion.span>
        
        {/* Subtitle with current variation */}
        <AnimatePresence mode="wait">
          <motion.span
            key={selectedVariation.label}
            className="text-xs font-medium opacity-60"
            style={{ color: selectedVariation.color }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 0.6 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {selectedVariation.label}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* Hover indicator dots */}
      <motion.div 
        className="flex space-x-1 ml-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {logoVariations.map((variation) => (
          <motion.button
            key={variation.label}
            className="w-2 h-2 rounded-full cursor-pointer"
            style={{ 
              backgroundColor: variation === selectedVariation 
                ? variation.color 
                : `${variation.color}40`
            }}
            onClick={() => setSelectedVariation(variation)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
