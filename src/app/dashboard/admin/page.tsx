"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import StatCard from "@/components/dashboard/StatCard";
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
  Calendar,
  Shield
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
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
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
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
  const mockStats = {
    totalPatients: 1247,
    patientsThisMonth: 89,
    totalScans: 3456,
    scansToday: 23,
    highRiskPatients: 34,
    completedDiagnoses: 98.7
  };

  const mockActivities = [
    {
      id: '1',
      title: 'Hasil Scan Diterima',
      description: 'Pasien John Doe - Diabetic Retinopathy terdeteksi (Severity: Moderate)',
      time: '5 menit yang lalu',
      icon: Eye,
      type: 'warning' as const
    },
    {
      id: '2', 
      title: 'Pasien Baru Terdaftar',
      description: 'Jane Smith telah bergabung sebagai pasien baru',
      time: '15 menit yang lalu',
      icon: UserPlus,
      type: 'success' as const
    },
    {
      id: '3',
      title: 'Laporan Harian Selesai',
      description: 'Laporan analisis retina hari ini telah diselesaikan',
      time: '1 jam yang lalu',
      icon: FileText,
      type: 'info' as const
    }
  ];

  return (
    <AdminLayout>
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Pasien"
            value={mockStats.totalPatients.toLocaleString('id-ID')}
            change="+12% dari bulan lalu"
            changeType="increase"
            icon={Users}
            description="Pasien terdaftar aktif"
          />
          <StatCard
            title="Scan Hari Ini"
            value={mockStats.scansToday}
            change="23 scan baru"
            changeType="neutral"
            icon={Eye}
            description="Hasil retina scan"
          />
          <StatCard
            title="Risiko Tinggi"
            value={mockStats.highRiskPatients}
            change="Perlu perhatian"
            changeType="warning"
            icon={AlertTriangle}
            description="Pasien berisiko tinggi"
          />
          <StatCard
            title="Akurasi Diagnosa"
            value={`${mockStats.completedDiagnoses}%`}
            change="+2.3% improvement"
            changeType="increase"
            icon={CheckCircle}
            description="Tingkat akurasi AI"
          />
        </div>

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
                onClick={() => console.log('Upload clicked')}
              />
              <QuickActionCard
                title="Tambah Pasien"
                description="Daftarkan pasien baru ke dalam sistem"
                icon={UserPlus}
                color="success"
                onClick={() => console.log('Add patient clicked')}
              />
              <QuickActionCard
                title="Lihat Laporan"
                description="Akses laporan komprehensif dan analisis data"
                icon={FileText}
                color="secondary"
                onClick={() => console.log('Reports clicked')}
              />
              <QuickActionCard
                title="Pengaturan Sistem"
                description="Konfigurasi sistem dan parameter AI"
                icon={Settings}
                color="warning"
                onClick={() => console.log('Settings clicked')}
              />
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <RecentActivityCard
              title="Aktivitas Terbaru"
              activities={mockActivities}
            />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Placeholder */}
          <ChartCard title="Statistik Diagnosa" icon={BarChart3}>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-[var(--accent)]/5 to-transparent rounded-xl border border-[var(--accent)]/10">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-[var(--accent)] mx-auto mb-4" />
                <p className="text-[var(--muted)] text-sm">Chart akan diimplementasikan</p>
                <p className="text-[var(--muted)] text-xs">dengan library seperti Chart.js atau Recharts</p>
              </div>
            </div>
          </ChartCard>

          {/* Patient Overview Chart */}
          <ChartCard title="Trend Pasien Bulanan" icon={Activity}>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-500/5 to-transparent rounded-xl border border-green-500/10">
              <div className="text-center">
                <Activity className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-[var(--muted)] text-sm">Trend analysis chart</p>
                <p className="text-[var(--muted)] text-xs">Menampilkan pertumbuhan pasien</p>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Calendar Section */}
        <div className="mt-8">
          <ChartCard title="Jadwal & Appointment" icon={Calendar} className="w-full">
            <div className="h-48 flex items-center justify-center bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl border border-blue-500/10">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <p className="text-[var(--muted)] text-sm">Kalender appointment</p>
                <p className="text-[var(--muted)] text-xs">Kelola jadwal konsultasi pasien</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </AdminLayout>
  );
}
