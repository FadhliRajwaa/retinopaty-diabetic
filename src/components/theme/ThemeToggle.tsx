"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#393E46]/10 to-[#393E46]/20 animate-pulse" />
    );
  }

  const isDark = (theme ?? resolvedTheme) === "dark" || resolvedTheme === "dark";

  return (
    <motion.button
      aria-label="Toggle theme"
      className="relative h-10 w-10 rounded-full bg-white dark:bg-gradient-to-br dark:from-[#393E46]/10 dark:to-[#393E46]/20 border border-gray-300 dark:border-transparent hover:bg-gray-50 dark:hover:from-[#00ADB5]/20 dark:hover:to-[#00ADB5]/30 overflow-hidden shadow-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#00ADB5]/20 to-transparent"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0.8 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
      
      {/* Icon container */}
      <div className="relative z-10 h-full w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Sun className="h-5 w-5 text-[#00ADB5] drop-shadow-sm" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Moon className="h-5 w-5 text-[#393E46] drop-shadow-sm" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle border animation */}
      <motion.div
        className="absolute inset-0 rounded-full border border-[#00ADB5]/30"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      />
    </motion.button>
  );
}
