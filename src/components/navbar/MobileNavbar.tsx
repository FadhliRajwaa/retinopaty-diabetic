"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SignOutButton } from "@/components/auth/SignOutButton";

interface MobileNavbarProps {
  user: { 
    id: string; 
    email?: string; 
    user_metadata?: { 
      full_name?: string; 
      name?: string; 
      role?: string;
    } 
  } | null;
  role?: string;
  dashboardHref: string;
}

export function MobileNavbar({ user, role, dashboardHref }: MobileNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Get user display name from metadata or email
  const userName = user?.user_metadata?.full_name || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'Pengguna';

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1 rounded-lg bg-white dark:bg-[#393E46] border border-gray-300 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-[#393E46]/80 transition-colors"
        onClick={toggleMenu}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className="w-6 h-0.5 bg-gray-800 dark:bg-white rounded-full"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 4 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.span
          className="w-6 h-0.5 bg-gray-800 dark:bg-white rounded-full"
          animate={{
            opacity: isOpen ? 0 : 1,
            x: isOpen ? -10 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.span
          className="w-6 h-0.5 bg-gray-800 dark:bg-white rounded-full"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -4 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleMenu}
            />
            
            {/* Menu Panel */}
            <motion.div
              className="fixed top-16 left-0 right-0 bg-background backdrop-blur-lg border-b border-border shadow-lg z-50 md:hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="px-4 py-6 space-y-4">
                {user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 }}
                      className="flex items-center gap-3 p-3 bg-[#00ADB5]/10 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#00ADB5] flex items-center justify-center text-white font-semibold">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{userName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            role === 'admin' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                            {role === 'admin' ? 'Admin' : 'Pasien'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link
                        href={dashboardHref}
                        className="flex items-center justify-center h-12 rounded-lg bg-[#00ADB5] text-white font-medium hover:brightness-110 transition-colors"
                        onClick={toggleMenu}
                      >
                        Dashboard {role === "admin" ? "Admin" : "Pasien"}
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div onClick={toggleMenu}>
                        <SignOutButton variant="dropdown" />
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex justify-center"
                    >
                      <ThemeToggle />
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link
                        href="/auth/login"
                        className="flex items-center justify-center h-12 rounded-lg bg-[#00ADB5] text-white font-medium hover:brightness-110 transition-colors"
                        onClick={toggleMenu}
                      >
                        Masuk
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link
                        href="/auth/register"
                        className="flex items-center justify-center h-12 rounded-lg bg-transparent border border-white hover:bg-white/10 transition-colors text-white font-medium"
                        onClick={toggleMenu}
                      >
                        Daftar
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-center pt-2"
                    >
                      <ThemeToggle />
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
