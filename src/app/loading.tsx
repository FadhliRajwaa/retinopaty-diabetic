export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9997] grid place-items-center bg-[var(--background)]/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--accent)]/30 border-t-[var(--accent)] animate-spin" />
        <p className="text-sm text-[var(--muted)]">Memuat halaman...</p>
      </div>
    </div>
  );
}
