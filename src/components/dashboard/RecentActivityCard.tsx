'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface RecentActivityCardProps {
  activities: ActivityItem[];
  title: string;
}

export default function RecentActivityCard({ activities, title }: RecentActivityCardProps) {
  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface)]/80 backdrop-blur border border-[var(--muted)]/20 p-6 transition-all duration-300 hover:shadow-lg hover:border-[var(--accent)]/30">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">{title}</h3>
          
          <div className="space-y-4 max-h-80 overflow-y-auto dashboard-scroll">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-[var(--surface)]/50 transition-colors duration-200"
              >
                <div className={`flex-shrink-0 p-2 rounded-lg border ${getActivityColor(activity.type)}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] mb-1">
                    {activity.title}
                  </p>
                  <p className="text-xs text-[var(--muted)] mb-2 line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--muted)]">Tidak ada aktivitas terbaru</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
