"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Settings,
  User as UserIcon,
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/auth/login?next=/dashboard/admin/settings";
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
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00ADB5]/30 border-t-[#00ADB5] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-foreground">Memuat pengaturan...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Pengaturan
          </h1>
          <p className="text-[var(--muted)] text-lg">
            Konfigurasi sistem dan parameter aplikasi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Kategori</h3>
              <nav className="space-y-2">
                <a href="#profile" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--accent)] text-white">
                  <UserIcon className="w-4 h-4" />
                  Profil Admin
                </a>
                <a href="#notifications" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:bg-[var(--muted)]/10 transition-colors">
                  <Bell className="w-4 h-4" />
                  Notifikasi
                </a>
                <a href="#security" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:bg-[var(--muted)]/10 transition-colors">
                  <Shield className="w-4 h-4" />
                  Keamanan
                </a>
                <a href="#system" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:bg-[var(--muted)]/10 transition-colors">
                  <Database className="w-4 h-4" />
                  Sistem
                </a>
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <div id="profile" className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <UserIcon className="w-6 h-6 text-[var(--accent)]" />
                <h3 className="text-xl font-semibold text-[var(--foreground)]">Profil Admin</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      defaultValue="Administrator"
                      className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      disabled
                      className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--muted)]/5 text-[var(--muted)] cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-colors">
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <div id="notifications" className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-[var(--accent)]" />
                <h3 className="text-xl font-semibold text-[var(--foreground)]">Notifikasi</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Pasien Baru Mendaftar</p>
                    <p className="text-sm text-[var(--muted)]">Notifikasi saat ada pendaftaran pasien baru</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-[var(--muted)]/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/25 rounded-full peer dark:bg-[var(--muted)]/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--muted)]/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:bg-[var(--surface)] dark:border-[var(--muted)]/30 peer-checked:bg-[var(--accent)]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Scan Retina Selesai</p>
                    <p className="text-sm text-[var(--muted)]">Notifikasi saat hasil scan AI tersedia</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-[var(--muted)]/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/25 rounded-full peer dark:bg-[var(--muted)]/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--muted)]/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:bg-[var(--surface)] dark:border-[var(--muted)]/30 peer-checked:bg-[var(--accent)]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div id="security" className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-[var(--accent)]" />
                <h3 className="text-xl font-semibold text-[var(--foreground)]">Keamanan</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Ubah Password
                  </label>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Password lama"
                      className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                    />
                    <input
                      type="password"
                      placeholder="Password baru"
                      className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                    />
                    <input
                      type="password"
                      placeholder="Konfirmasi password baru"
                      className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                    />
                  </div>
                  <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-colors">
                    <Save className="w-4 h-4" />
                    Update Password
                  </button>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div id="system" className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-[var(--accent)]" />
                <h3 className="text-xl font-semibold text-[var(--foreground)]">Sistem</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--muted)]/5 rounded-lg">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Cache Database</p>
                    <p className="text-sm text-[var(--muted)]">Bersihkan cache untuk performa optimal</p>
                  </div>
                  <button className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    Clear Cache
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-[var(--muted)]/5 rounded-lg">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Backup Database</p>
                    <p className="text-sm text-[var(--muted)]">Backup data secara manual</p>
                  </div>
                  <button className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    <Database className="w-4 h-4" />
                    Backup Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
