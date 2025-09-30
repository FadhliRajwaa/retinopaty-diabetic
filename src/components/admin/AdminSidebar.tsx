"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard,
  Users,
  ScanLine,
  FileBarChart,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";

interface AdminSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  onClose?: () => void;
}

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard/admin"
  },
  {
    icon: Users,
    label: "Kelola Pasien",
    href: "/dashboard/admin/patients"
  },
  {
    icon: ScanLine,
    label: "Scan Retina",
    href: "/dashboard/admin/scans"
  },
  {
    icon: FileBarChart,
    label: "Laporan & Riwayat",
    href: "/dashboard/admin/reports"
  },
  {
    icon: UserCheck,
    label: "Konfirmasi Pasien",
    href: "/dashboard/admin/approvals"
  },
  {
    icon: Settings,
    label: "Pengaturan",
    href: "/dashboard/admin/settings"
  }
];

export default function AdminSidebar({ 
  className = "",
  isCollapsed: externalCollapsed,
  onToggleCollapse,
  onClose
}: AdminSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const pathname = usePathname();
  
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse(!isCollapsed);
    } else {
      setInternalCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`
      ${isCollapsed ? 'w-16' : 'w-64'} 
      bg-[var(--surface)] border-r border-[var(--muted)]/20 
      transition-all duration-300 ease-in-out
      flex flex-col h-full
      ${className}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-[var(--muted)]/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-[var(--foreground)]">RetinaAI</span>
            </div>
          )}
          <button
            onClick={handleToggle}
            className="p-1 rounded-md hover:bg-[var(--muted)]/10 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[var(--muted)]" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg 
                transition-all duration-200 group
                ${isActive 
                  ? 'bg-[var(--accent)] text-white shadow-sm' 
                  : 'hover:bg-[var(--muted)]/10 text-[var(--muted)] hover:text-[var(--foreground)]'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`
                w-5 h-5 flex-shrink-0
                ${isActive ? 'text-white' : 'group-hover:text-[var(--accent)]'}
              `} />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--muted)]/20">
        {!isCollapsed && (
          <div className="space-y-2">
            <div className="text-xs text-[var(--muted)] px-3">
              Admin Panel
            </div>
            <SignOutButton 
              variant="sidebar" 
              className="w-full justify-start gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500 transition-colors"
            />
          </div>
        )}
        {isCollapsed && (
          <button
            className="w-full p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500 transition-colors flex items-center justify-center"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
