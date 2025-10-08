"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-600 shadow-2xl',
    borderColor: 'border-green-700',
    iconColor: 'text-white',
    titleColor: 'text-white font-bold',
    messageColor: 'text-green-100'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-600 shadow-2xl',
    borderColor: 'border-red-700',
    iconColor: 'text-white',
    titleColor: 'text-white font-bold',
    messageColor: 'text-red-100'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-500 shadow-2xl',
    borderColor: 'border-yellow-600',
    iconColor: 'text-white',
    titleColor: 'text-white font-bold',
    messageColor: 'text-yellow-100'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-600 shadow-2xl',
    borderColor: 'border-blue-700',
    iconColor: 'text-white',
    titleColor: 'text-white font-bold',
    messageColor: 'text-blue-100'
  }
};

export default function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3 
      }}
      className={`
        w-full ${config.bgColor} ${config.borderColor} border-2 rounded-lg 
        pointer-events-auto overflow-hidden
        transform-gpu will-change-transform min-h-[80px]
      `}
    >
      <div className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
          </div>
          <div className="ml-4 w-0 flex-1">
            <p className={`text-base ${config.titleColor}`}>
              {title}
            </p>
            {message && (
              <p className={`mt-2 text-sm ${config.messageColor}`}>
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="rounded-md inline-flex text-white hover:opacity-75 focus:outline-none transition-opacity duration-200 p-1"
              onClick={() => onClose(id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <motion.div
        className="h-2 bg-black bg-opacity-20"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}
