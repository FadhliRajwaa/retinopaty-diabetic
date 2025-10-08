"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/contexts/ToastContext";
import { 
  User as UserIcon,
  Bell,
  Shield,
  Save,
  Check,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

interface NotificationSettings {
  new_patient: boolean;
  scan_complete: boolean;
  high_risk_detected: boolean;
  daily_report: boolean;
}

export default function SettingsPage() {
  const { showSuccess, showError } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile states
  const [profileData, setProfileData] = useState<UserProfile>({ id: '', full_name: '', email: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState<NotificationSettings>({
    new_patient: true,
    scan_complete: true,
    high_risk_detected: true,
    daily_report: false
  });
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  
  // Security states
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

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
      await loadProfileData(user);
      loadNotificationSettings();
      setLoading(false);
    };

    checkUser();
  }, []);

  const loadProfileData = async (currentUser: User) => {
    try {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('user_id', currentUser.id)
        .single();
      
      if (profile) {
        setProfileData({
          id: profile.id,
          full_name: profile.full_name || 'Administrator',
          email: profile.email || currentUser.email || ''
        });
      } else {
        setProfileData({
          id: '',
          full_name: 'Administrator', 
          email: currentUser.email || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadNotificationSettings = () => {
    // Load from localStorage or default values
    const saved = localStorage.getItem('admin_notification_settings');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    setProfileLoading(true);
    setProfileSuccess(false);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: profileData.full_name,
          email: profileData.email,
          role: 'admin',
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      showSuccess('Profil Berhasil Diperbarui', 'Data profil admin telah berhasil disimpan.');
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Gagal Memperbarui Profil', 'Terjadi kesalahan saat menyimpan data profil.');
    } finally {
      setProfileLoading(false);
    }
  };

  const updateNotifications = () => {
    setNotificationLoading(true);
    setNotificationSuccess(false);
    
    // Save to localStorage
    localStorage.setItem('admin_notification_settings', JSON.stringify(notifications));
    
    setTimeout(() => {
      showSuccess('Pengaturan Notifikasi Tersimpan', 'Preferensi notifikasi berhasil diperbarui.');
      setNotificationSuccess(true);
      setNotificationLoading(false);
      setTimeout(() => setNotificationSuccess(false), 3000);
    }, 500);
  };

  const updatePassword = async () => {
    if (!user) return;
    
    setSecurityLoading(true);
    setSecurityError('');
    setSecuritySuccess(false);
    
    // Validate passwords
    if (passwords.new !== passwords.confirm) {
      setSecurityError('Password baru dan konfirmasi tidak cocok');
      setSecurityLoading(false);
      return;
    }
    
    if (passwords.new.length < 6) {
      setSecurityError('Password minimal 6 karakter');
      setSecurityLoading(false);
      return;
    }
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      
      if (error) throw error;
      
      setPasswords({ current: '', new: '', confirm: '' });
      showSuccess('Password Berhasil Diubah', 'Password admin telah berhasil diperbarui.');
      setSecuritySuccess(true);
      setTimeout(() => setSecuritySuccess(false), 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengubah password';
      setSecurityError(errorMessage);
      showError('Gagal Mengubah Password', errorMessage);
    } finally {
      setSecurityLoading(false);
    }
  };

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
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
                    activeTab === 'profile' 
                      ? 'bg-[var(--accent)] text-white' 
                      : 'text-[var(--muted)] hover:bg-[var(--muted)]/10'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  Profil Admin
                </button>
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
                    activeTab === 'notifications' 
                      ? 'bg-[var(--accent)] text-white' 
                      : 'text-[var(--muted)] hover:bg-[var(--muted)]/10'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Notifikasi
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
                    activeTab === 'security' 
                      ? 'bg-[var(--accent)] text-white' 
                      : 'text-[var(--muted)] hover:bg-[var(--muted)]/10'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Keamanan
                </button>
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-6">
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
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                        className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--muted)]/5 text-[var(--muted)] cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={updateProfile}
                      disabled={profileLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-colors disabled:opacity-50"
                    >
                      {profileLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    
                    {profileSuccess && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Profil berhasil diperbarui!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-[var(--accent)]" />
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">Pengaturan Notifikasi</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-[var(--muted)]/20">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">Pasien Baru Mendaftar</p>
                      <p className="text-sm text-[var(--muted)]">Notifikasi saat ada pendaftaran pasien baru</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications.new_patient}
                        onChange={(e) => setNotifications({...notifications, new_patient: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[var(--muted)]/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--muted)]/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-[var(--muted)]/20">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">Scan Retina Selesai</p>
                      <p className="text-sm text-[var(--muted)]">Notifikasi saat hasil scan AI tersedia</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications.scan_complete}
                        onChange={(e) => setNotifications({...notifications, scan_complete: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[var(--muted)]/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--muted)]/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-[var(--muted)]/20">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">Risiko Tinggi Terdeteksi</p>
                      <p className="text-sm text-[var(--muted)]">Notifikasi khusus saat AI mendeteksi diabetic retinopathy</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications.high_risk_detected}
                        onChange={(e) => setNotifications({...notifications, high_risk_detected: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[var(--muted)]/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--muted)]/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">Laporan Harian</p>
                      <p className="text-sm text-[var(--muted)]">Ringkasan aktivitas harian dikirim setiap akhir hari</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications.daily_report}
                        onChange={(e) => setNotifications({...notifications, daily_report: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[var(--muted)]/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--muted)]/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4">
                    <button 
                      onClick={updateNotifications}
                      disabled={notificationLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-colors disabled:opacity-50"
                    >
                      {notificationLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {notificationLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                    
                    {notificationSuccess && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Pengaturan notifikasi berhasil disimpan!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            
            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-[var(--accent)]" />
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">Keamanan Account</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-4">
                      Ubah Password
                    </label>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          placeholder="Password lama"
                          value={passwords.current}
                          onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                          className="w-full px-3 py-2 pr-10 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          placeholder="Password baru (minimal 6 karakter)"
                          value={passwords.new}
                          onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                          className="w-full px-3 py-2 pr-10 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          placeholder="Konfirmasi password baru"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                          className="w-full px-3 py-2 pr-10 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {securityError && (
                      <div className="mt-3 flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{securityError}</span>
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center gap-3">
                      <button 
                        onClick={updatePassword}
                        disabled={securityLoading || !passwords.new || !passwords.confirm}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-colors disabled:opacity-50"
                      >
                        {securityLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                        {securityLoading ? 'Memperbarui...' : 'Update Password'}
                      </button>
                      
                      {securitySuccess && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Password berhasil diubah!</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">Persyaratan Password:</h4>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Minimal 6 karakter</li>
                      <li>• Kombinasi huruf dan angka disarankan</li>
                      <li>• Hindari menggunakan password yang mudah ditebak</li>
                      <li>• Jangan gunakan informasi pribadi</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
