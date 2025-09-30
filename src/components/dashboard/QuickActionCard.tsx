'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export default function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  href, 
  color = 'primary' 
}: QuickActionCardProps) {
  const colorVariants = {
    primary: 'from-[var(--accent)]/10 to-[var(--accent)]/5 border-[var(--accent)]/20 text-[var(--accent)]',
    secondary: 'from-[var(--muted)]/10 to-[var(--muted)]/5 border-[var(--muted)]/20 text-[var(--muted)]',
    success: 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-500',
    warning: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 text-yellow-500',
    danger: 'from-red-500/10 to-red-500/5 border-red-500/20 text-red-500'
  };

  const Component = href ? 'a' : 'button';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Component
        href={href}
        onClick={onClick}
        className="relative group block w-full p-6 rounded-2xl bg-[var(--surface)]/80 backdrop-blur border border-[var(--muted)]/20 transition-all duration-300 hover:shadow-lg hover:border-[var(--accent)]/30"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
        
        <div className="relative z-10">
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorVariants[color]} mb-4`}>
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">{description}</p>
        </div>
      </Component>
    </motion.div>
  );
}
