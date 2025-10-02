"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Sparkles, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const needRegister = searchParams.get("need_register") === "1";
  const [role, setRole] = useState<"admin" | "patient">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}&next=/${role === "admin" ? "dashboard/admin" : "dashboard/patient"}`,
      },
    });

    setLoading(false);
    if (error) return setError(error.message);

    if (data.session && data.user) {
      // User is directly logged in (no email confirmation required)
      // Create user profile
      try {
        await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          email: data.user.email!,
          role: role,
          status: role === 'admin' ? 'approved' : 'pending'
        });
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Gate immediate access: patients must wait for admin approval
      if (role === 'patient') {
        await supabase.auth.signOut();
        router.push("/auth/pending");
        return;
      }

      // Admin can proceed directly
      router.push("/dashboard/admin");
    } else {
      setMessage("Pendaftaran berhasil. Silakan masuk untuk melanjutkan.");
      // Redirect to login page for email confirmation
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    }
  };

  return (
    <div className="mx-auto max-w-md w-full px-4 py-6 sm:py-10">
      <div className="rounded-2xl border border-[#393E46]/20 bg-[#EEEEEE]/90 dark:bg-[#222831]/90 backdrop-blur p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-[#EEEEEE]">Daftar</h1>
        <p className="text-sm text-gray-600 dark:text-[#EEEEEE]/70 mt-1">Buat akun untuk gunakan RetinaAI</p>

        {needRegister && (
          <div className="mt-4 rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#00ADB5]/20 via-[#00ADB5]/10 to-transparent border border-[#00ADB5]/30 shadow-[0_0_0_1px_rgba(0,173,181,0.15)]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 rounded-xl bg-[#00ADB5]/20 ring-1 ring-[#00ADB5]/30">
                <Sparkles className="w-5 h-5 text-[#00ADB5]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-[#00ADB5]">Butuh Pendaftaran</p>
                <p className="text-sm text-gray-700 dark:text-[#EEEEEE]/80 mt-1">
                  Kami tidak menemukan profil Anda. Silakan lengkapi pendaftaran di bawah ini untuk membuat akun baru.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a href="#register-form" className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium bg-[#00ADB5] text-white hover:brightness-110">Buat Akun Sekarang</a>
                  <Link href="/auth/login" className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium border border-[#00ADB5]/30 text-[#00ADB5] hover:bg-[#00ADB5]/10">Sudah punya akun?</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 bg-[#393E46]/10 p-1 rounded-lg">
          <button
            onClick={() => setRole("patient")}
            className={`h-9 rounded-md text-sm font-medium transition-colors ${
              role === "patient"
                ? "bg-white text-[#222831] dark:bg-[#393E46] dark:text-[#EEEEEE]"
                : "text-gray-700 dark:text-[#EEEEEE]/80 hover:bg-white/60 dark:hover:bg-[#393E46]/60"
            }`}
          >
            Pasien
          </button>
          <button
            onClick={() => setRole("admin")}
            className={`h-9 rounded-md text-sm font-medium transition-colors ${
              role === "admin"
                ? "bg-white text-[#222831] dark:bg-[#393E46] dark:text-[#EEEEEE]"
                : "text-gray-700 dark:text-[#EEEEEE]/80 hover:bg-white/60 dark:hover:bg-[#393E46]/60"
            }`}
          >
            Admin / Tim Medis
          </button>
        </div>

        <form id="register-form" onSubmit={onSubmit} className="mt-6 space-y-4">
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
          {error && <div className="text-sm text-red-600">{error}</div>}
          {message && <div className="text-sm text-green-600">{message}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-md bg-[#00ADB5] text-white font-medium hover:brightness-110 transition disabled:opacity-70 inline-flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? "Memproses..." : "Daftar"}</span>
          </button>
        </form>

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#393E46]/30 to-transparent" />

        <GoogleButton label="Daftar dengan Google" role={role} />

        <p className="mt-6 text-sm text-gray-600 dark:text-[#EEEEEE]/70">
          Sudah punya akun? {" "}
          <Link href="/auth/login" className="text-[#00ADB5] hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
