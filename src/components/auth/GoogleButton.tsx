"use client";

import { createClient } from "@/lib/supabase/client";
import { getURL } from "@/lib/auth-config";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function GoogleButton({
  label = "Masuk dengan Google",
  role,
}: {
  label?: string;
  role?: "admin" | "patient";
}) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const baseURL = getURL();
      const redirectTo = `${baseURL}auth/callback${role ? `?role=${role}` : ""}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="h-11 inline-flex items-center justify-center gap-2 w-full rounded-md px-4 text-sm font-medium bg-white text-[#222831] border border-[#393E46]/30 hover:bg-[#EEEEEE] hover:text-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed dark:bg-[#222831] dark:text-[#EEEEEE] dark:hover:text-black"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="h-4 w-4"
        >
          <path
            fill="#FFC107"
            d="M43.611 20.083H42V20H24v8h11.303C33.602 32.329 29.229 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.869 6.053 29.702 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
          />
          <path
            fill="#FF3D00"
            d="M6.306 14.691l6.571 4.817C14.4 16.108 18.835 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.869 6.053 29.702 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.167 0 9.86-1.977 13.409-5.222l-6.2-5.238C29.136 35.091 26.715 36 24 36c-5.213 0-9.573-3.647-10.994-8.548l-6.58 5.066C9.742 39.556 16.322 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.611 20.083H42V20H24v8h11.303c-1.079 3.329-3.418 6.102-6.894 7.539l.006-.004 6.2 5.238C36.167 40.978 40 36.667 40 30c0-1.341-.138-2.651-.389-3.917z"
          />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
}
