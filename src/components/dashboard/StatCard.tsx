'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral' | 'warning';
  icon: LucideIcon;
  description?: string;
}

export default function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, description }: StatCardProps) {
  const changeColors = {
    increase: 'text-green-500',
    decrease: 'text-red-500',
    neutral: 'text-[var(--muted)]',
    warning: 'text-yellow-500'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface)]/80 backdrop-blur border border-[var(--muted)]/20 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-[var(--accent)]/30">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--muted)] mb-2">{title}</p>
            <p className="text-3xl font-bold text-[var(--foreground)] mb-1">{value}</p>
            {change && (
              <p className={`text-sm ${changeColors[changeType]} flex items-center gap-1`}>
                {change}
              </p>
            )}
            {description && (
              <p className="text-xs text-[var(--muted)] mt-2">{description}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5 border border-[var(--accent)]/20">
              <Icon className="h-6 w-6 text-[var(--accent)]" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
