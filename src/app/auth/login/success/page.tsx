"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const supabase = createClient();
      
      // Wait a bit for session to be properly set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify session exists
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session check in success page:', session);
      
      // Force refresh the router to update server components
      router.refresh();
      
      // Redirect to home after ensuring session is ready
      setTimeout(() => {
        // Force a hard navigation to ensure server components re-render
        window.location.href = "/";
      }, 1000);
    };

    checkSessionAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#00ADB5]/30 border-t-[#00ADB5] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg text-foreground">Login berhasil, mengalihkan...</p>
      </div>
    </div>
  );
}
