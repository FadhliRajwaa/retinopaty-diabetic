"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md w-full px-4 py-10">Memuat...</div>}>
      <LoginView />
    </Suspense>
  );
}

function LoginView() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);

    const role = (data.user?.user_metadata as { role?: string } | null)?.role;
    if (role === "admin") return router.push("/dashboard/admin");
    if (role === "patient") return router.push("/dashboard/patient");
    router.push(next);
  };

  return (
    <div className="mx-auto max-w-md w-full px-4 py-6 sm:py-10">
      <div className="rounded-2xl border border-[#393E46]/20 bg-[#EEEEEE]/90 dark:bg-[#222831]/90 backdrop-blur p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-[#EEEEEE]">Masuk</h1>
        <p className="text-sm text-gray-600 dark:text-[#EEEEEE]/70 mt-1">Akses dashboard Admin/Pasien RetinaAI</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-[#EEEEEE]">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full h-11 rounded-md border border-[#393E46]/30 bg-white/90 dark:bg-[#393E46]/20 px-3 outline-none focus:ring-2 ring-[#00ADB5] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-[#EEEEEE]/50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-[#EEEEEE]">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full h-11 rounded-md border border-[#393E46]/30 bg-white/90 dark:bg-[#393E46]/20 px-3 outline-none focus:ring-2 ring-[#00ADB5] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-[#EEEEEE]/50"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-md bg-[#00ADB5] text-white font-medium hover:brightness-110 transition disabled:opacity-70"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#393E46]/30 to-transparent" />

        <GoogleButton label="Masuk dengan Google" next={next} />

        <p className="mt-6 text-sm text-gray-600 dark:text-[#EEEEEE]/70">
          Belum punya akun? {" "}
          <Link href="/auth/register" className="text-[#00ADB5] hover:underline">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
