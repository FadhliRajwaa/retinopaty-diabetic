"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import { 
  Eye, 
  Calendar, 
  AlertCircle, 
  Heart, 
  Upload, 
  FileText, 
  Phone, 
  User as UserIcon,
  Activity,
  Clock,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function PatientDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/auth/login?next=/dashboard/patient";
        return;
      }

      // Gate by approval status and role
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role,status')
        .eq('user_id', user.id)
        .single();

      // If not approved, send to pending page and stop
      if (!profile || profile.status !== 'approved') {
        window.location.href = '/auth/pending';
        return;
      }

      // If role is not patient, reroute to admin dashboard
      if (profile.role !== 'patient') {
        window.location.href = '/dashboard/admin';
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
  const mockPatientData = {
    totalScans: 8,
    lastScanDate: "2024-01-15",
    riskLevel: "Low",
    upcomingAppointments: 2,
    healthScore: 85
  };

  const mockActivities = [
    {
      id: '1',
      title: 'Hasil Scan Tersedia',
      description: 'Hasil retina scan terbaru Anda telah dianalisis - Status: Normal',
      time: '2 hari yang lalu',
      icon: Eye,
      type: 'success' as const
    },
    {
      id: '2', 
      title: 'Appointment Reminder',
      description: 'Anda memiliki jadwal konsultasi besok pukul 10:00',
      time: '1 hari yang lalu',
      icon: Calendar,
      type: 'info' as const
    },
    {
      id: '3',
      title: 'Laporan Kesehatan',
      description: 'Laporan kesehatan bulanan Anda telah dibuat',
      time: '5 hari yang lalu',
      icon: FileText,
      type: 'info' as const
    }
  ];

  const mockMedicalHistory = [
    {
      date: '2024-01-15',
      type: 'Retina Scan',
      result: 'Normal',
      doctor: 'Dr. Ahmad',
      notes: 'Tidak ditemukan tanda-tanda diabetic retinopathy'
    },
    {
      date: '2023-12-10',
      type: 'Follow-up',
      result: 'Good Progress',
      doctor: 'Dr. Siti',
      notes: 'Kondisi mata stabil, lanjutkan perawatan'
    },
    {
      date: '2023-11-05',
      type: 'Initial Screening',
      result: 'Mild DR',
      doctor: 'Dr. Ahmad',
      notes: 'Detected mild diabetic retinopathy, monitoring required'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--surface)]">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
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
              <ThemeToggle />
              <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">Pasien</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Scan"
            value={mockPatientData.totalScans}
            change="Last scan: Jan 15"
            changeType="neutral"
            icon={Eye}
            description="Riwayat pemeriksaan"
          />
          <StatCard
            title="Risk Level"
            value={mockPatientData.riskLevel}
            change="Stable condition"
            changeType="increase"
            icon={Heart}
            description="Tingkat risiko retinopati"
          />
          <StatCard
            title="Health Score"
            value={`${mockPatientData.healthScore}%`}
            change="+5% improvement"
            changeType="increase"
            icon={TrendingUp}
            description="Skor kesehatan mata"
          />
          <StatCard
            title="Upcoming"
            value={mockPatientData.upcomingAppointments}
            change="Appointments"
            changeType="neutral"
            icon={Calendar}
            description="Jadwal mendatang"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Aksi Cepat</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <QuickActionCard
                title="Upload Foto Mata"
                description="Unggah foto mata untuk pemeriksaan mandiri"
                icon={Upload}
                color="primary"
                onClick={() => console.log('Upload clicked')}
              />
              <QuickActionCard
                title="Jadwalkan Konsultasi"
                description="Buat appointment dengan dokter mata"
                icon={Calendar}
                color="success"
                onClick={() => console.log('Schedule clicked')}
              />
              <QuickActionCard
                title="Riwayat Medical"
                description="Lihat hasil pemeriksaan dan diagnosis sebelumnya"
                icon={FileText}
                color="secondary"
                onClick={() => console.log('History clicked')}
              />
              <QuickActionCard
                title="Hubungi Dokter"
                description="Konsultasi langsung dengan tim medis"
                icon={Phone}
                color="warning"
                onClick={() => console.log('Contact clicked')}
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

        {/* Medical History and Health Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Medical History */}
          <ChartCard title="Riwayat Medical" icon={FileText}>
            <div className="space-y-4">
              {mockMedicalHistory.map((record, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-[var(--surface)]/50 border border-[var(--muted)]/10">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg ${
                      record.result === 'Normal' ? 'bg-green-500/10 border border-green-500/20' :
                      record.result === 'Good Progress' ? 'bg-blue-500/10 border border-blue-500/20' :
                      'bg-yellow-500/10 border border-yellow-500/20'
                    }`}>
                      {record.result === 'Normal' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : record.result === 'Good Progress' ? (
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-[var(--foreground)]">{record.type}</p>
                      <span className="text-xs text-[var(--muted)]">{record.date}</span>
                    </div>
                    <p className="text-sm text-[var(--accent)] mb-1">{record.result}</p>
                    <p className="text-xs text-[var(--muted)] mb-1">Dr: {record.doctor}</p>
                    <p className="text-xs text-[var(--muted)] line-clamp-2">{record.notes}</p>
                  </div>
                </div>
              ))}
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

        {/* Upcoming Appointments */}
        <div>
          <ChartCard title="Jadwal Mendatang" icon={Clock} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent)]/5 to-transparent border border-[var(--accent)]/10">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-5 w-5 text-[var(--accent)]" />
                  <div>
                    <h4 className="font-medium text-[var(--foreground)]">Kontrol Rutin</h4>
                    <p className="text-sm text-[var(--muted)]">Dr. Ahmad Santoso</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--foreground)] mb-1">Besok, 10:00 WIB</p>
                <p className="text-xs text-[var(--muted)]">Pemeriksaan lanjutan retina</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-[var(--foreground)]">Konsultasi</h4>
                    <p className="text-sm text-[var(--muted)]">Dr. Siti Nurhaliza</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--foreground)] mb-1">28 Jan, 14:00 WIB</p>
                <p className="text-xs text-[var(--muted)]">Diskusi hasil scan terbaru</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
