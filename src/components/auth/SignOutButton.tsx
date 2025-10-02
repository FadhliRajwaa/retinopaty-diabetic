"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Loader2 } from "lucide-react";

export function SignOutButton({ 
  variant = "default",
  className = "",
  showLabel = true
}: { 
  variant?: "default" | "dropdown" | "sidebar";
  className?: string;
  showLabel?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSignOut = async () => {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setLoading(false);
  };

  if (variant === "dropdown") {
    return (
      <button
        onClick={onSignOut}
        disabled={loading}
        className={`w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-60 ${className}`}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Keluar...</span>
        ) : (
          "Keluar"
        )}
      </button>
    );
  }

  if (variant === "sidebar") {
    return (
      <button
        onClick={onSignOut}
        disabled={loading}
        className={`flex items-center disabled:opacity-60 ${className}`}
      >
        {loading ? (
          <Loader2 className={`w-4 h-4 animate-spin ${showLabel ? 'mr-2' : ''}`} />
        ) : (
          <LogOut className={`w-4 h-4 ${showLabel ? 'mr-2' : ''}`} />
        )}
        {showLabel && (loading ? 'Keluar...' : 'Keluar')}
      </button>
    );
  }

  return (
    <button
      onClick={onSignOut}
      disabled={loading}
      className={`h-10 inline-flex items-center rounded-md px-4 text-sm font-medium border border-[#393E46]/30 hover:bg-[#393E46]/10 transition-colors disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Keluar...</span>
      ) : (
        "Keluar"
      )}
    </button>
  );
}
