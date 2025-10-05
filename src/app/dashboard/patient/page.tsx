"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
// QuickActionCard removed: patient dashboard is information-only
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import { 
  Eye, 
  AlertCircle, 
  Heart, 
  FileText, 
  User as UserIcon,
  Activity,
  TrendingUp,
  
} from "lucide-react";
// ThemeToggle now handled in sidebar for patient dashboard

type LatestScan = { id?: string; image_url?: string; analysis_date?: string; prediction?: string; confidence?: number; notes?: string };
type ReportItem = { id: string; title?: string; summary?: string; created_at?: string };

export default function PatientDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dashLoading, setDashLoading] = useState(true);
  const [latest, setLatest] = useState<LatestScan | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [activityItems, setActivityItems] = useState<Array<{ id: string; title: string; description: string; time: string; type: 'info' | 'success' | 'warning' | 'error' }>>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth/login?next=/dashboard/patient";
        return;
      }
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role,status')
        .eq('user_id', user.id)
        .single();
      if (!profile || profile.status !== 'approved') {
        window.location.href = '/auth/pending';
        return;
      }
      if (profile.role !== 'patient') {
        window.location.href = '/dashboard/admin';
        return;
      }
      setUser(user);
      setAuthLoading(false);

      try {
        setDashLoading(true);
        const res = await fetch('/api/patient/dashboard', { cache: 'no-store' });
        const json = await res.json();
        if (res.ok) {
          setLatest(json.latestScan || null);
          setReports(json.reports || []);
          setActivityItems(json.activities || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setDashLoading(false);
      }
    };
    load();
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

  // Mock data - Dalam implementasi nyata, ini akan diambil dari database
  const totalReports = reports.length;
  const lastScanDate = latest?.analysis_date ? new Date(latest.analysis_date).toLocaleDateString('id-ID') : '-';
  const healthScore = typeof latest?.confidence === 'number' ? Math.round(latest.confidence) : undefined;

  const pickIcon = (t: 'info'|'success'|'warning'|'error') => t === 'success' ? Eye : t === 'warning' ? AlertCircle : FileText;
  const activitiesForCard = activityItems.map(a => ({ ...a, icon: pickIcon(a.type) }));

  // Riwayat akan berasal dari `reports` (data nyata)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--surface)] animate-fade-in">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8" id="home" aria-label="home" >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                Dashboard Pasien
              </h1>
              <p className="text-[var(--muted)] text-lg">
                Selamat datang, <span className="font-medium text-[var(--accent)]">{user.email}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 animate-scale-in">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">Pasien</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {dashLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[0,1,2].map(i => (
              <div key={i} className="rounded-2xl bg-[var(--surface)]/80 backdrop-blur border border-[var(--muted)]/20 p-6">
                <div className="h-4 w-24 shimmer rounded mb-3" />
                <div className="h-8 w-32 shimmer rounded mb-2" />
                <div className="h-3 w-40 shimmer rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 scroll-mt-24">
            <StatCard
              title="Total Laporan"
              value={totalReports}
              change={`Last scan: ${lastScanDate}`}
              changeType="neutral"
              icon={FileText}
              description="Jumlah laporan kesehatan"
            />
            <StatCard
              title="Status Terbaru"
              value={latest?.prediction || '-'}
              change={latest?.analysis_date ? new Date(latest.analysis_date).toLocaleString('id-ID') : 'Belum ada data'}
              changeType="neutral"
              icon={Heart}
              description="Prediksi hasil terakhir"
            />
            <StatCard
              title="Health Score"
              value={typeof healthScore === 'number' ? `${healthScore}%` : '-'}
              change="Diperbarui saat hasil baru tersedia"
              changeType="increase"
              icon={TrendingUp}
              description="Perkiraan tingkat kesehatan mata"
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 scroll-mt-24">
          {/* Hasil Terbaru */}
          <section id="latest" aria-label="hasil-terbaru" className="lg:col-span-2 animate-scale-in scroll-mt-24">
            <ChartCard title="Hasil Terbaru" icon={Eye}>
              {dashLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="p-4 rounded-xl border border-[var(--muted)]/20">
                      <div className="h-3 w-24 shimmer rounded mb-2" />
                      <div className="h-6 w-32 shimmer rounded" />
                    </div>
                  ))}
                </div>
              ) : latest ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent)]/5 to-transparent border border-[var(--accent)]/10">
                      <p className="text-sm text-[var(--muted)]">Tanggal Pemeriksaan</p>
                      <p className="text-lg font-semibold text-[var(--foreground)] mt-1">{lastScanDate}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/10">
                      <p className="text-sm text-[var(--muted)]">Status</p>
                      <p className="text-lg font-semibold text-green-500 mt-1">{latest.prediction || '-'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
                      <p className="text-sm text-[var(--muted)]">Health Score</p>
                      <p className="text-lg font-semibold text-blue-500 mt-1">{typeof healthScore === 'number' ? `${healthScore}%` : '-'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--muted)]/10 to-transparent border border-[var(--muted)]/20">
                      <p className="text-sm text-[var(--muted)]">Catatan</p>
                      <p className="text-sm text-[var(--foreground)] mt-1">{latest.notes || '-'}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={() => window.open('/api/patient/latest/pdf', '_blank')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:brightness-110 active:scale-[.98] transition-all">
                      Unduh Laporan PDF
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--muted)]/30 hover:bg-[var(--muted)]/10 transition-all">
                      Lihat Detail Hasil
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-[var(--muted)]">Belum ada hasil terbaru.</div>
              )}
            </ChartCard>
          </section>

          {/* Aktivitas Terbaru */}
          <section id="activities" aria-label="aktivitas-terbaru" className="animate-slide-up scroll-mt-24">
            <RecentActivityCard
              title="Aktivitas Terbaru"
              activities={activitiesForCard}
            />
          </section>
        </div>

        {/* Medical History and Health Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 scroll-mt-24" id="history" aria-label="riwayat-medical">
          {/* Medical History */}
          <ChartCard title="Riwayat Medical" icon={FileText}>
            <div className="space-y-4">
              {dashLoading ? (
                [0,1,2].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-[var(--surface)]/50 border border-[var(--muted)]/10 animate-pulse">
                    <div className="h-4 w-32 shimmer rounded mb-2" />
                    <div className="h-3 w-48 shimmer rounded" />
                  </div>
                ))
              ) : reports.length > 0 ? (
                reports.map((r, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-[var(--surface)]/50 border border-[var(--muted)]/10 animate-slide-up" style={{animationDelay: `${index * 40}ms`}}>
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${
                        'bg-blue-500/10 border border-blue-500/20'
                      }`}>
                        <FileText className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[var(--foreground)]">{r.title || 'Laporan Kesehatan'}</p>
                        <span className="text-xs text-[var(--muted)]">{r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-'}</span>
                      </div>
                      <p className="text-xs text-[var(--muted)] line-clamp-2">{r.summary || 'Ringkasan laporan tidak tersedia.'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[var(--muted)]">Belum ada riwayat.</div>
              )}
            </div>
          </ChartCard>

          {/* Health Progress Chart */}
          <ChartCard title="Progress Kesehatan" icon={Activity}>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-500/5 to-transparent rounded-xl border border-green-500/10">
              <div className="text-center">
                <Activity className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-[var(--muted)] text-sm">Grafik progress kesehatan</p>
                <p className="text-[var(--muted)] text-xs">Menampilkan perkembangan kondisi mata</p>
              </div>
            </div>
          </ChartCard>
        </div>

      </div>
    </div>
  );
}
