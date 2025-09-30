"use client";

import AdminSidebar from "./AdminSidebar";
import { useState } from "react";
import { Menu } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar 
        className={`fixed left-0 top-0 h-full z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main content */}
      <div 
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--muted)]/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-[var(--muted)]/10 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-[var(--foreground)]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">RA</span>
              </div>
              <span className="font-semibold text-[var(--foreground)]">RetinaAI</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--background)]">
          {children}
        </div>
      </div>
    </div>
  );
}
