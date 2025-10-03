"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Users,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Save,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface Patient {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
}

export default function PatientsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    status: 'pending' as Patient['status']
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/auth/login?next=/dashboard/admin/patients";
        return;
      }

      const role = (user.user_metadata as { role?: string } | null)?.role;
      if (role !== "admin") {
        window.location.href = "/dashboard/patient";
        return;
      }

      setUser(user);
      await loadPatients();
      setLoading(false);
    };

    checkUser();
  }, []);

  const loadPatients = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'patient')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.email || !formData.password) {
        alert('Email dan password wajib diisi');
        return;
      }
      setCreateLoading(true);
      const res = await fetch('/api/admin/patients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
          status: formData.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan pasien');
      await loadPatients();
      setShowCreateModal(false);
      resetForm();
      alert('Pasien berhasil ditambahkan!');
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Gagal menambahkan pasien!');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPatient) return;
    try {
      setUpdateLoading(true);
      const res = await fetch('/api/admin/patients/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedPatient.user_id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
          status: formData.status,
          password: formData.password || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui pasien');
      await loadPatients();
      setShowEditModal(false);
      setSelectedPatient(null);
      resetForm();
      alert('Data pasien berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Gagal memperbarui data pasien!');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPatient) return;
    try {
      setDeleteLoading(true);
      const res = await fetch('/api/admin/patients/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedPatient.user_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus pasien');
      await loadPatients();
      setShowDeleteModal(false);
      setSelectedPatient(null);
      alert('Pasien berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Gagal menghapus pasien!');
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      address: '',
      status: 'pending'
    });
  };

  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      full_name: patient.full_name || '',
      email: patient.email,
      password: '',
      phone: patient.phone || '',
      date_of_birth: patient.date_of_birth || '',
      gender: patient.gender || '',
      address: patient.address || '',
      status: patient.status
    });
    setShowEditModal(true);
  };

  const openViewModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const openDeleteModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'suspended':
        return <XCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20';
      case 'suspended':
        return 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-500/20';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00ADB5]/30 border-t-[#00ADB5] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-foreground">Memuat data pasien...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--foreground)] mb-1 sm:mb-2">
                Kelola Pasien
              </h1>
              <p className="text-[var(--muted)] text-sm sm:text-base lg:text-lg">
                Manajemen data pasien dan persetujuan akun
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-colors text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Pasien
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Cari pasien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--muted)] shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-sm sm:min-w-[140px]"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Summary Cards - Ultra Compact */}
        <div className="grid grid-cols-2 gap-2 mb-4 sm:gap-3 sm:mb-6 lg:grid-cols-4 lg:gap-4 lg:mb-8">
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)] mb-0.5 truncate">Total</p>
                <p className="text-lg sm:text-xl font-bold text-[var(--foreground)]">{patients.length}</p>
              </div>
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent)] shrink-0" />
            </div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)] mb-0.5 truncate">Disetujui</p>
                <p className="text-lg sm:text-xl font-bold text-green-500">
                  {patients.filter(p => p.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 shrink-0" />
            </div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)] mb-0.5 truncate">Menunggu</p>
                <p className="text-lg sm:text-xl font-bold text-yellow-500">
                  {patients.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 shrink-0" />
            </div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)] mb-0.5 truncate">Ditolak</p>
                <p className="text-lg sm:text-xl font-bold text-red-500">
                  {patients.filter(p => p.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 shrink-0" />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg overflow-x-auto scrollbar-thin">
          <div className="px-6 py-4 border-b border-[var(--muted)]/20">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Daftar Pasien</h3>
          </div>
          
          <table className="w-full min-w-[960px]">
            <thead className="bg-[var(--muted)]/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Pasien
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Kontak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Tanggal Daftar
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--muted)] uppercase tracking-wider whitespace-nowrap w-36">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--muted)]/10">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-[var(--muted)]/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-[var(--accent)] font-medium text-sm">
                          {patient.full_name?.charAt(0).toUpperCase() || patient.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          {patient.full_name || 'Nama tidak tersedia'}
                        </div>
                        <div className="text-sm text-[var(--muted)]">{patient.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {patient.phone && (
                        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                          <Phone className="w-3 h-3" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <Mail className="w-3 h-3" />
                        <span>{patient.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {getStatusIcon(patient.status)}
                      {patient.status === 'approved' ? 'Disetujui' : 
                       patient.status === 'rejected' ? 'Ditolak' : 
                       patient.status === 'suspended' ? 'Suspended' : 'Menunggu'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(patient.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => openViewModal(patient)}
                        className="p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors rounded-lg hover:bg-[var(--accent)]/10"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(patient)}
                        className="p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors rounded-lg hover:bg-[var(--accent)]/10"
                        title="Edit Pasien"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(patient)}
                        className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                        title="Hapus Pasien"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-3">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Daftar Pasien</h3>
            <p className="text-sm text-[var(--muted)] mt-1">{filteredPatients.length} pasien ditemukan</p>
          </div>
          
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-4">
              {/* Header dengan avatar dan nama */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-[var(--accent)] font-medium text-base">
                    {patient.full_name?.charAt(0).toUpperCase() || patient.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-semibold text-[var(--foreground)] mb-1">
                    {patient.full_name || 'Nama tidak tersedia'}
                  </h4>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                    {getStatusIcon(patient.status)}
                    {patient.status === 'approved' ? 'Disetujui' : 
                     patient.status === 'rejected' ? 'Ditolak' : 
                     patient.status === 'suspended' ? 'Suspended' : 'Menunggu'}
                  </span>
                </div>
              </div>

              {/* Kontak info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{patient.email}</span>
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Phone className="w-3 h-3 shrink-0" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>Bergabung {new Date(patient.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-[var(--muted)]/10">
                <button 
                  onClick={() => openViewModal(patient)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[var(--accent)] bg-[var(--accent)]/5 border border-[var(--accent)]/20 hover:bg-[var(--accent)]/10 transition-colors rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                  Lihat
                </button>
                <button 
                  onClick={() => openEditModal(patient)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[var(--accent)] bg-[var(--accent)]/5 border border-[var(--accent)]/20 hover:bg-[var(--accent)]/10 transition-colors rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => openDeleteModal(patient)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg">
            <div className="px-4 sm:px-6 py-12 text-center">
              <Users className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Tidak ada pasien ditemukan</h3>
              <p className="text-[var(--muted)]">
                {searchTerm || statusFilter !== "all" 
                  ? "Coba ubah filter atau kata kunci pencarian"
                  : "Mulai tambah pasien untuk melihat data di sini"
                }
              </p>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Tambah Pasien Baru</h2>
                <button 
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="p-1 hover:bg-[var(--muted)]/10 rounded-lg"
                >
                  <X className="w-5 h-5 text-[var(--muted)]" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                    placeholder="Masukkan email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                    placeholder="Masukkan password awal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as Patient['status']})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Alamat</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {createLoading ? 'Menyimpan...' : 'Simpan Pasien'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Edit Pasien</h2>
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedPatient(null); resetForm(); }}
                  className="p-1 hover:bg-[var(--muted)]/10 rounded-lg"
                >
                  <X className="w-5 h-5 text-[var(--muted)]" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Password Baru (opsional)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                    placeholder="Kosongkan jika tidak mengubah password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as Patient['status']})}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Alamat</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setShowEditModal(false); setSelectedPatient(null); resetForm(); }}
                  className="px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Update Pasien
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Detail Pasien</h2>
                <button 
                  onClick={() => { setShowViewModal(false); setSelectedPatient(null); }}
                  className="p-1 hover:bg-[var(--muted)]/10 rounded-lg"
                >
                  <X className="w-5 h-5 text-[var(--muted)]" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--accent)]">
                      {selectedPatient.full_name?.charAt(0).toUpperCase() || selectedPatient.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[var(--muted)]/5 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-[var(--muted)] mb-1">Nama Lengkap</label>
                    <p className="text-[var(--foreground)] font-medium">{selectedPatient.full_name || 'Tidak tersedia'}</p>
                  </div>
                  <div className="bg-[var(--muted)]/5 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-[var(--muted)] mb-1">Email</label>
                    <p className="text-[var(--foreground)] font-medium">{selectedPatient.email}</p>
                  </div>
                  <div className="bg-[var(--muted)]/5 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-[var(--muted)] mb-1">Telepon</label>
                    <p className="text-[var(--foreground)] font-medium">{selectedPatient.phone || 'Tidak tersedia'}</p>
                  </div>
                  <div className="bg-[var(--muted)]/5 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-[var(--muted)] mb-1">Tanggal Lahir</label>
                    <p className="text-[var(--foreground)] font-medium">
                      {selectedPatient.date_of_birth ? new Date(selectedPatient.date_of_birth).toLocaleDateString('id-ID') : 'Tidak tersedia'}
                    </p>
                  </div>
                  <div className="bg-[var(--muted)]/5 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-[var(--muted)] mb-1">Jenis Kelamin</label>
                    <p className="text-[var(--foreground)] font-medium">
                      {selectedPatient.gender === 'male' ? 'Laki-laki' : selectedPatient.gender === 'female' ? 'Perempuan' : 'Tidak tersedia'}
                    </p>
                  </div>
                  <div className="bg-[var(--muted)]/5 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-[var(--muted)] mb-1">Status</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPatient.status)}`}>
                      {getStatusIcon(selectedPatient.status)}
                      {selectedPatient.status === 'approved' ? 'Disetujui' : 
                       selectedPatient.status === 'rejected' ? 'Ditolak' : 
                       selectedPatient.status === 'suspended' ? 'Suspended' : 'Menunggu'}
                    </span>
                  </div>
                  <div className="bg-[var(--muted)]/5 p-4 rounded-lg md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--muted)] mb-1">Alamat</label>
                    <p className="text-[var(--foreground)] font-medium">{selectedPatient.address || 'Tidak tersedia'}</p>
                  </div>
                  <div className="bg-[var(--muted)]/5 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-[var(--muted)] mb-1">Tanggal Daftar</label>
                    <p className="text-[var(--foreground)] font-medium">{new Date(selectedPatient.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="bg-[var(--muted)]/5 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-[var(--muted)] mb-1">Terakhir Update</label>
                    <p className="text-[var(--foreground)] font-medium">{new Date(selectedPatient.updated_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setShowViewModal(false); setSelectedPatient(null); }}
                  className="px-4 py-2 bg-[var(--muted)]/10 text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)]/20 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => { setShowViewModal(false); openEditModal(selectedPatient); }}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Edit Pasien
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Hapus Pasien</h2>
                <button 
                  onClick={() => { setShowDeleteModal(false); setSelectedPatient(null); }}
                  className="p-1 hover:bg-[var(--muted)]/10 rounded-lg"
                >
                  <X className="w-5 h-5 text-[var(--muted)]" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Yakin ingin menghapus?</h3>
                <p className="text-[var(--muted)] text-sm">
                  Pasien <strong>{selectedPatient.full_name || selectedPatient.email}</strong> akan dihapus permanen. 
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setSelectedPatient(null); }}
                  className="px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-60"
                >
                  {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleteLoading ? 'Menghapus...' : 'Hapus Pasien'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
