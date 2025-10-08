"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ToastPortalProps {
  children: React.ReactNode;
}

export default function ToastPortal({ children }: ToastPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999999] space-y-2 pointer-events-none max-w-sm">
      {children}
    </div>,
    document.body
  );
}
