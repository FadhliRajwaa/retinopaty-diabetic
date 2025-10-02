"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  UserCheck,
  Check,
  X,
  Clock,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  Search,
  Loader2
} from "lucide-react";

interface PendingPatient {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function ApprovalsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPatients, setPendingPatients] = useState<PendingPatient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/auth/login?next=/dashboard/admin/approvals";
        return;
      }

      const role = (user.user_metadata as { role?: string } | null)?.role;
      if (role !== "admin") {
        window.location.href = "/dashboard/patient";
        return;
      }

      setUser(user);
      await loadPendingPatients();
      setLoading(false);
    };

    checkUser();
  }, []);

  const loadPendingPatients = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'patient')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingPatients(data || []);
    } catch (error) {
      console.error('Error loading pending patients:', error);
    }
  };

  const approvePatient = async (patientId: string) => {
    try {
      setActionLoadingId(patientId);
      setActionType('approve');
      const supabase = createClient();
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('user_id', patientId);

      if (error) throw error;
      
      // Reload data
      await loadPendingPatients();
      
      // Create audit log
      await supabase.from('audit_logs').insert({
        table_name: 'user_profiles',
        record_id: patientId,
        action: 'approve',
        performed_by: user?.id,
        new_values: { status: 'approved' }
      });
      
    } catch (error) {
      console.error('Error approving patient:', error);
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  const rejectPatient = async (patientId: string) => {
    try {
      setActionLoadingId(patientId);
      setActionType('reject');
      const supabase = createClient();
      const { error } = await supabase
        .from('user_profiles')
        .update({ status: 'rejected' })
        .eq('user_id', patientId);

      if (error) throw error;
      
      // Reload data
      await loadPendingPatients();
      
      // Create audit log
      await supabase.from('audit_logs').insert({
        table_name: 'user_profiles',
        record_id: patientId,
        action: 'reject',
        performed_by: user?.id,
        new_values: { status: 'rejected' }
      });
      
    } catch (error) {
      console.error('Error rejecting patient:', error);
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  const filteredPatients = pendingPatients.filter(patient => 
    patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00ADB5]/30 border-t-[#00ADB5] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-foreground">Memuat konfirmasi pasien...</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                Konfirmasi Pasien
              </h1>
              <p className="text-[var(--muted)] text-lg">
                Setujui atau tolak pendaftaran pasien baru
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                {pendingPatients.length} menunggu persetujuan
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Cari pasien berdasarkan nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            />
          </div>
        </div>

        {/* Pending Patients */}
        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  
                  {/* Patient Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                      {patient.full_name || 'Nama tidak tersedia'}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <Mail className="w-4 h-4" />
                        <span>{patient.email}</span>
                      </div>
                      
                      {patient.phone && (
                        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                          <Phone className="w-4 h-4" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <Calendar className="w-4 h-4" />
                        <span>Daftar: {new Date(patient.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      
                      {patient.date_of_birth && (
                        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                          <UserIcon className="w-4 h-4" />
                          <span>Lahir: {new Date(patient.date_of_birth).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                    
                    {patient.address && (
                      <p className="text-sm text-[var(--muted)] mb-4">
                        <strong>Alamat:</strong> {patient.address}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-500/20">
                        <Clock className="w-3 h-3" />
                        Menunggu Persetujuan
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => approvePatient(patient.user_id)}
                    disabled={actionLoadingId === patient.user_id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-60"
                  >
                    {actionLoadingId === patient.user_id && actionType === 'approve' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Setujui
                  </button>
                  <button
                    onClick={() => rejectPatient(patient.user_id)}
                    disabled={actionLoadingId === patient.user_id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
                  >
                    {actionLoadingId === patient.user_id && actionType === 'reject' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-12 text-center">
            <UserCheck className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
              {searchTerm ? 'Tidak ada hasil pencarian' : 'Tidak ada pasien menunggu persetujuan'}
            </h3>
            <p className="text-[var(--muted)]">
              {searchTerm 
                ? 'Coba ubah kata kunci pencarian'
                : 'Semua pendaftaran pasien sudah disetujui atau ditolak'
              }
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
