"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  Home,
  Eye,
  FileText,
  Activity,
  Menu,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { LucideIcon } from "lucide-react";

function NavItem({ href, label, Icon, active, onClick }: {
  href: string;
  label: string;
  Icon: LucideIcon;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
        ${active ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--muted)] hover:bg-[var(--muted)]/10 hover:text-[var(--foreground)]"}`}
    >
      <Icon className={`w-4 h-4 ${active ? "text-[var(--accent)]" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"}`} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function PatientSidebar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("home");

  const items = useMemo(() => ([
    { href: "/dashboard/patient#home", id: "home", label: "Beranda", Icon: Home },
    { href: "/dashboard/patient#latest", id: "latest", label: "Hasil Terbaru", Icon: Eye },
    { href: "/dashboard/patient#history", id: "history", label: "Riwayat Hasil", Icon: FileText },
    { href: "/dashboard/patient#activities", id: "activities", label: "Aktivitas", Icon: Activity },
  ]), []);

  useEffect(() => {
    // Initialize active from hash on mount
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') || 'home';
      setActive(hash);
    }
    // Scroll spy
    const ids = items.map(i => i.id);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if (id) setActive(id);
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const hash = href.split('#')[1];
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        // Apply offset for mobile topbar (approx 56-64px)
        const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
        const offset = isDesktop ? 0 : 64;
        const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        if (typeof window !== 'undefined') {
          const url = `/dashboard/patient#${hash}`;
          window.history.pushState(null, '', url);
        } else {
          router.push(href);
        }
        setActive(hash);
        setOpen(false);
      } else {
        router.push(href);
      }
    } else {
      router.push(href);
    }
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5 pb-4 border-b border-[var(--muted)]/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--muted)]">RetinaAI</p>
            <p className="text-lg font-semibold text-[var(--foreground)]">Dashboard Pasien</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 animate-fade-in">
        {items.map(({ href, id, label, Icon }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            Icon={Icon}
            active={active === id}
            onClick={(e) => handleNavigate(e, href)}
          />
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--muted)]/10 flex items-center justify-between">
        <ThemeToggle />
        <SignOutButton variant="sidebar" className="text-[var(--muted)] hover:text-red-500 text-sm" />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--background)/0.7] border-b border-[var(--muted)]/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--muted)]/20 hover:bg-[var(--muted)]/10 active:scale-[.98]"
          >
            <Menu className="w-4 h-4 text-[var(--muted)]" />
            <span className="text-sm text-[var(--foreground)]">Menu</span>
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[var(--muted)]/10 bg-[var(--surface)]/60 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--surface)/0.5] animate-slide-up">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black/40 animate-fade-in" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] bg-[var(--surface)] border-r border-[var(--muted)]/10 shadow-xl animate-dropdown">
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
