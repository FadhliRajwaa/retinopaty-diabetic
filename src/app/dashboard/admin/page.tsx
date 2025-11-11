"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import StatCard from "@/components/dashboard/StatCard";
import AnimatedPage from "@/components/shared/AnimatedPage";
import ChartCard from "@/components/dashboard/ChartCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Upload, 
  UserPlus, 
  FileText, 
  Settings,
  BarChart3,
  Eye,
  Shield
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/navigation";

type AdminApiResponse = {
  stats: { totalPatients: number; scansToday: number; highRiskScans30d: number };
  diagnosisStats: { 
    'No DR': number; 
    'Mild DR': number; 
    'Moderate DR': number; 
    'Severe DR': number; 
    'Proliferative DR': number;
    // Legacy support
    DR?: number; 
    NO_DR?: number; 
  };
  monthlyTrend: { month: string; count: number }[];
  activities: { id: string; title: string; description: string; time: string; type: 'info'|'success'|'warning'|'error'; source: 'patient'|'scan'|'report' }[];
  updatedAt: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dashLoading, setDashLoading] = useState(true);
  const [data, setData] = useState<AdminApiResponse | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth/login?next=/dashboard/admin";
        return;
      }
      const role = (user.user_metadata as { role?: string } | null)?.role;
      if (role !== "admin") {
        window.location.href = "/dashboard/patient";
        return;
      }
      setUser(user);
      setAuthLoading(false);

      const fetchDashboard = async () => {
        try {
          setDashLoading(true);
          const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
          const json = await res.json();
          if (res.ok) setData(json as AdminApiResponse);
        } catch (e) {
          console.error('Failed to load admin dashboard', e);
        } finally {
          setDashLoading(false);
        }
      };

      await fetchDashboard();

      // Supabase Realtime: refetch on table changes
      const channel = supabase
        .channel('admin-dashboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, fetchDashboard)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'scans' }, fetchDashboard)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'scan_results' }, fetchDashboard)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, fetchDashboard)
        .subscribe();

      return () => {
        try { supabase.removeChannel(channel); } catch {}
      };
    };
    void init();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00ADB5]/30 border-t-[#00ADB5] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-foreground">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = data?.stats;
  const diag = data?.diagnosisStats;
  const trend = data?.monthlyTrend || [];
  
  // Calculate 5-class statistics
  const noDR = diag?.['No DR'] || 0;
  const mildDR = diag?.['Mild DR'] || 0; 
  const moderateDR = diag?.['Moderate DR'] || 0;
  const severeDR = diag?.['Severe DR'] || 0;
  const proliferativeDR = diag?.['Proliferative DR'] || 0;
  
  // Legacy support
  const legacyDR = diag?.DR || 0;
  const legacyNoDR = diag?.NO_DR || 0;
  
  const totalDiag = noDR + mildDR + moderateDR + severeDR + proliferativeDR + legacyDR + legacyNoDR;
  const normalPct = totalDiag ? Math.round((noDR + legacyNoDR) / totalDiag * 100) : 0;
  const drPct = totalDiag ? 100 - normalPct : 0;
  const trendMax = trend.reduce((m, p) => Math.max(m, p.count), 0);
  const pickIcon = (source: 'patient'|'scan'|'report', type: 'info'|'success'|'warning'|'error') => {
    if (source === 'patient') return UserPlus;
    if (source === 'report') return FileText;
    return type === 'warning' ? AlertTriangle : Eye;
  };
  const activitiesForCard = (data?.activities || []).map(a => ({ ...a, icon: pickIcon(a.source, a.type) }));

  return (
    <AdminLayout>
      <AnimatedPage className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
                Dashboard Admin
              </h1>
              <p className="text-[var(--muted)] text-base sm:text-lg">
                Selamat datang kembali, <span className="font-medium text-[var(--accent)]">{user.email}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <div className="px-3 sm:px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-[var(--accent)]" />
                  <span className="text-xs sm:text-sm font-medium text-[var(--accent)]">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {dashLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {[0,1,2,3].map(i => (
              <div key={i} className="rounded-2xl bg-[var(--surface)]/80 backdrop-blur border border-[var(--muted)]/20 p-6">
                <div className="h-4 w-24 shimmer rounded mb-3" />
                <div className="h-8 w-32 shimmer rounded mb-2" />
                <div className="h-3 w-40 shimmer rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Pasien"
              value={(stats?.totalPatients ?? 0).toLocaleString('id-ID')}
              change={data?.updatedAt ? `Update: ${new Date(data.updatedAt).toLocaleTimeString('id-ID')}` : undefined}
              changeType="neutral"
              icon={Users}
              description="Pasien terdaftar aktif"
            />
            <StatCard
              title="Scan Hari Ini"
              value={stats?.scansToday ?? 0}
              change="Realtime"
              changeType="neutral"
              icon={Eye}
              description="Hasil retina scan"
            />
            <StatCard
              title="Risiko Tinggi 30 Hari"
              value={stats?.highRiskScans30d ?? 0}
              change="Prediksi DR"
              changeType="warning"
              icon={AlertTriangle}
              description="Perlu perhatian"
            />
            <StatCard
              title="Diagnosa 30 Hari"
              value={totalDiag}
              change={`DR ${drPct}% · Normal ${normalPct}%`}
              changeType="neutral"
              icon={CheckCircle}
              description="Distribusi hasil"
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Aksi Cepat</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <QuickActionCard
                title="Upload Scan Retina"
                description="Unggah dan analisis gambar retina pasien dengan AI diagnostik"
                icon={Upload}
                color="primary"
                onClick={() => router.push('/dashboard/admin/scans')}
              />
              <QuickActionCard
                title="Tambah Pasien"
                description="Daftarkan pasien baru ke dalam sistem"
                icon={UserPlus}
                color="success"
                onClick={() => router.push('/dashboard/admin/patients')}
              />
              <QuickActionCard
                title="Lihat Laporan"
                description="Akses laporan komprehensif dan analisis data"
                icon={FileText}
                color="secondary"
                onClick={() => router.push('/dashboard/admin/reports')}
              />
              <QuickActionCard
                title="Pengaturan Sistem"
                description="Konfigurasi sistem dan parameter AI"
                icon={Settings}
                color="warning"
                onClick={() => router.push('/dashboard/admin/settings')}
              />
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            {dashLoading ? (
              <div className="rounded-2xl bg-[var(--surface)]/80 backdrop-blur border border-[var(--muted)]/20 p-6">
                <div className="h-5 w-48 shimmer rounded mb-6" />
                {[0,1,2,3].map(i => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-xl">
                    <div className="w-8 h-8 shimmer rounded-lg" />
                    <div className="flex-1">
                      <div className="h-3 w-40 shimmer rounded mb-2" />
                      <div className="h-3 w-64 shimmer rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <RecentActivityCard
                title="Aktivitas Terbaru"
                activities={activitiesForCard}
              />
            )}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Diagnosis Stats (simple stacked bar) */}
          <ChartCard title="Statistik Diagnosa (30 Hari)" icon={BarChart3}>
            {dashLoading ? (
              <div className="h-64 shimmer rounded-xl" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                  <span>Total Diagnosa</span>
                  <span>{totalDiag}</span>
                </div>
                <div className="h-8 w-full rounded-lg overflow-hidden border border-[var(--muted)]/20 flex">
                  <div className="h-full bg-red-500/70" style={{ width: `${drPct}%` }} title={`DR ${drPct}%`} />
                  <div className="h-full bg-green-500/70" style={{ width: `${normalPct}%` }} title={`Normal ${normalPct}%`} />
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>DR: {diag?.DR ?? 0}</span>
                  <span>Normal: {diag?.NO_DR ?? 0}</span>
                </div>
              </div>
            )}
          </ChartCard>

          {/* Monthly Patients Trend (simple bars) */}
          <ChartCard title="Trend Pasien Bulanan" icon={Activity}>
            {dashLoading ? (
              <div className="h-64 shimmer rounded-xl" />
            ) : (
              <div className="h-64 flex items-end gap-3 px-2">
                {trend.map((p, idx) => {
                  const hPct = trendMax ? Math.round((p.count / trendMax) * 100) : 0;
                  const [y, m] = p.month.split('-');
                  return (
                    <div key={`${p.month}-${idx}`} className="flex flex-col items-center gap-2">
                      <div className="w-8 bg-[var(--accent)]/70 rounded-t-md border border-[var(--accent)]/30" style={{ height: `${Math.max(hPct, 6)}%` }} />
                      <div className="text-[10px] text-[var(--muted)]">
                        {m}/{y.slice(2)}
                      </div>
                      <div className="text-[10px] text-[var(--muted)]">{p.count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>
        </div>
        {/* Jadwal & Appointment dihapus sesuai requirement */}
      </AnimatedPage>
    </AdminLayout>
  );
}
