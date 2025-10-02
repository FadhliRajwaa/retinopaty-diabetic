"use client";

import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full rounded-2xl border border-[var(--muted)]/20 bg-[var(--surface)] p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
          <span className="text-2xl">⏳</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Menunggu Persetujuan Admin</h1>
        <p className="text-[var(--muted)] mb-6">
          Akun Anda berhasil dibuat dan email telah dikonfirmasi. Saat ini akun berstatus
          <span className="font-semibold text-yellow-600 dark:text-yellow-400"> pending</span>.
          Anda akan bisa masuk setelah disetujui oleh Admin.
        </p>
        <div className="space-x-2">
          <Link href="/" className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:brightness-110">
            Kembali ke Beranda
          </Link>
          <Link href="/auth/login" className="inline-flex items-center px-4 py-2 rounded-lg border border-[var(--muted)]/30 text-[var(--foreground)] hover:bg-[var(--muted)]/10">
            Login Lagi
          </Link>
        </div>
        <div className="mt-6 text-xs text-[var(--muted)]">
          Jika butuh bantuan, hubungi Admin untuk mempercepat proses persetujuan.
        </div>
      </div>
    </div>
  );
}
