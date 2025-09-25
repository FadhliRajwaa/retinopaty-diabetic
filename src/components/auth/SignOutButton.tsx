"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  const onSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <button
      onClick={onSignOut}
      className="h-10 inline-flex items-center rounded-md px-4 text-sm font-medium border border-[#393E46]/30 hover:bg-[#393E46]/10 transition-colors"
    >
      Keluar
    </button>
  );
}
