'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export default function ChartCard({ title, icon: Icon, children, className = '' }: ChartCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`relative group ${className}`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface)]/80 backdrop-blur border border-[var(--muted)]/20 p-6 transition-all duration-300 hover:shadow-lg hover:border-[var(--accent)]/30">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5 border border-[var(--accent)]/20">
              <Icon className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
          </div>
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
