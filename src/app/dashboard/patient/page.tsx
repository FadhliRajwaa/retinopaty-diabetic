import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PatientDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard/patient");
  }

  return (
    <div className="mx-auto max-w-5xl w-full px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard Pasien</h1>
      <p className="mt-2 text-[#393E46]">
        Selamat datang, {user.email}. Ini adalah placeholder dashboard Pasien.
      </p>
      <div className="mt-6 rounded-xl border border-[#393E46]/20 p-6 bg-[var(--surface)]/80 backdrop-blur">
        <p className="text-sm">Fitur selanjutnya: Riwayat diagnosa, detail hasil, unggah foto (opsional jika diizinkan Admin).</p>
      </div>
    </div>
  );
}
