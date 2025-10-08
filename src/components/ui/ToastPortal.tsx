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
    <>
      {/* Mobile Toast Container */}
      <div className="fixed top-4 left-4 right-4 sm:hidden z-[999999999] space-y-3 pointer-events-none">
        {children}
      </div>
      {/* Desktop Toast Container */}
      <div className="hidden sm:block fixed top-6 right-6 z-[999999999] space-y-3 pointer-events-none w-96 max-w-md">
        {children}
      </div>
    </>,
    document.body
  );
}
