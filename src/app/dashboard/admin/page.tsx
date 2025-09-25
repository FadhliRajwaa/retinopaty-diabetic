import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard/admin");
  }

  const role = (user.user_metadata as { role?: string } | null)?.role;
  if (role !== "admin") {
    redirect("/dashboard/patient");
  }

  return (
    <div className="mx-auto max-w-5xl w-full px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard Admin</h1>
      <p className="mt-2 text-[#393E46]">
        Selamat datang, {user.email}. Ini adalah placeholder dashboard Admin.
      </p>
      <div className="mt-6 rounded-xl border border-[#393E46]/20 p-6 bg-[var(--surface)]/80 backdrop-blur">
        <p className="text-sm">Fitur selanjutnya: Upload hasil scan retina, analisis AI, kelola pasien.</p>
      </div>
    </div>
  );
}
