"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function SignOutButton({ 
  variant = "default",
  className = ""
}: { 
  variant?: "default" | "dropdown" | "sidebar";
  className?: string;
}) {
  const router = useRouter();

  const onSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  if (variant === "dropdown") {
    return (
      <button
        onClick={onSignOut}
        className={`w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors ${className}`}
      >
        Keluar
      </button>
    );
  }

  if (variant === "sidebar") {
    return (
      <button
        onClick={onSignOut}
        className={`flex items-center ${className}`}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Keluar
      </button>
    );
  }

  return (
    <button
      onClick={onSignOut}
      className={`h-10 inline-flex items-center rounded-md px-4 text-sm font-medium border border-[#393E46]/30 hover:bg-[#393E46]/10 transition-colors ${className}`}
    >
      Keluar
    </button>
  );
}
