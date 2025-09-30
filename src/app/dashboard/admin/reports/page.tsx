"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Search,
  Filter,
  Calendar,
  Eye,
  Download,
  Users,
  AlertTriangle,
  ScanLine,
  Brain,
  FileImage
} from "lucide-react";

interface ScanResult {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  image_url: string;
  prediction: 'DR' | 'NO_DR';
  confidence: number;
  analysis_date: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('');

  const loadScanResults = async () => {
    try {
      // Mock data - In real implementation, fetch from scan_results table
      const mockData: ScanResult[] = [
        {
          id: '1',
          patient_id: 'p1',
          patient_name: 'John Doe',
          patient_email: 'john@example.com',
          image_url: '/mock-retina-1.jpg',
          prediction: 'DR',
          confidence: 92.3,
          analysis_date: '2024-01-15T10:30:00Z',
          notes: 'Moderate diabetic retinopathy detected. Recommend follow-up in 3 months.',
          created_by: 'admin',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          patient_id: 'p2',
          patient_name: 'Jane Smith',
          patient_email: 'jane@example.com',
          image_url: '/mock-retina-2.jpg',
          prediction: 'NO_DR',
          confidence: 87.1,
          analysis_date: '2024-01-14T14:15:00Z',
          created_by: 'admin',
          created_at: '2024-01-14T14:15:00Z'
        }
      ];
      
      setScanResults(mockData);
    } catch (error) {
      console.error('Error loading scan results:', error);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/auth/login?next=/dashboard/admin/reports";
        return;
      }

      const role = (user.user_metadata as { role?: string } | null)?.role;
      if (role !== "admin") {
        window.location.href = "/dashboard/patient";
        return;
      }

      setUser(user);
      await loadScanResults();
      setLoading(false);
    };

    checkUser();
  }, []);

  const filteredResults = scanResults.filter(result => {
    const matchesSearch = result.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.patient_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesPeriod = true;
    if (periodFilter !== 'all') {
      const resultDate = new Date(result.analysis_date);
      const now = new Date();
      
      switch (periodFilter) {
        case 'today':
          matchesPeriod = resultDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesPeriod = resultDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesPeriod = resultDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesPeriod;
  });

  const totalScans = scanResults.length;
  const drDetected = scanResults.filter(r => r.prediction === 'DR').length;
  const averageConfidence = scanResults.length > 0 
    ? Math.round(scanResults.reduce((sum, r) => sum + r.confidence, 0) / scanResults.length * 10) / 10
    : 0;
  const activePatients = new Set(scanResults.map(r => r.patient_id)).size;

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00ADB5]/30 border-t-[#00ADB5] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-foreground">Memuat laporan...</p>
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
                Laporan & Riwayat
              </h1>
              <p className="text-[var(--muted)] text-sm sm:text-base lg:text-lg">
                Analisis data scan retina dan riwayat pasien
              </p>
            </div>
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export Laporan
            </button>
          </div>
        </div>

        {/* Summary Cards - Ultra Compact */}
        <div className="grid grid-cols-2 gap-2 mb-4 sm:gap-3 sm:mb-6 lg:grid-cols-4 lg:gap-4 lg:mb-8">
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)] mb-0.5 truncate">Total Scan</p>
                <p className="text-lg sm:text-xl font-bold text-[var(--foreground)]">{totalScans}</p>
                <p className="text-xs text-green-500 truncate">Data terkini</p>
              </div>
              <ScanLine className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent)] shrink-0" />
            </div>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)] mb-0.5 truncate">DR Terdeteksi</p>
                <p className="text-lg sm:text-xl font-bold text-red-500">{drDetected}</p>
                <p className="text-xs text-red-500 truncate">{totalScans > 0 ? Math.round((drDetected / totalScans) * 100) : 0}%</p>
              </div>
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 shrink-0" />
            </div>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)] mb-0.5 truncate">Akurasi AI</p>
                <p className="text-lg sm:text-xl font-bold text-green-500">{averageConfidence}%</p>
                <p className="text-xs text-green-500 truncate">Confidence</p>
              </div>
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 shrink-0" />
            </div>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)] mb-0.5 truncate">Pasien Aktif</p>
                <p className="text-lg sm:text-xl font-bold text-[var(--foreground)]">{activePatients}</p>
                <p className="text-xs text-[var(--muted)] truncate">Unique</p>
              </div>
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent)] shrink-0" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama pasien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-sm sm:text-base"
            />
          </div>
          <div className="flex gap-2 sm:gap-4">
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <Filter className="w-4 h-4 text-[var(--muted)] shrink-0" />
              <select 
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-2 py-2 sm:px-3 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-sm sm:text-base min-w-0 flex-1 sm:min-w-[140px]"
              >
                <option value="all">Semua Periode</option>
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <Calendar className="w-4 h-4 text-[var(--muted)] shrink-0" />
              <input
                type="date"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="px-2 py-2 sm:px-3 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-sm sm:text-base min-w-0 flex-1 sm:min-w-[140px]"
              />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--muted)]/20">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Riwayat Scan Pasien</h3>
          </div>
          
          <table className="w-full">
            <thead className="bg-[var(--muted)]/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Pasien
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Tanggal Scan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Hasil AI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Dokter
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--muted)]/10">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-[var(--muted)]/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-[var(--accent)] font-medium text-sm">
                          {result.patient_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-[var(--foreground)]">{result.patient_name}</span>
                        <p className="text-xs text-[var(--muted)]">{result.patient_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted)]">
                    {new Date(result.analysis_date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${result.prediction === 'DR'
                      ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20'
                      : 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-500/20'
                    }`}>
                      {result.prediction === 'DR' ? 'Diabetic Retinopathy' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                    {result.confidence}%
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted)]">
                    Dr. {result.created_by}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      className="p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors rounded-lg hover:bg-[var(--accent)]/10"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileImage className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Tidak ada data scan</h3>
                    <p className="text-[var(--muted)]">
                      {searchTerm || periodFilter !== 'all' 
                        ? 'Coba ubah filter atau kata kunci pencarian'
                        : 'Belum ada scan retina yang dilakukan'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-3">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Riwayat Scan Pasien</h3>
            <p className="text-sm text-[var(--muted)] mt-1">{filteredResults.length} riwayat scan</p>
          </div>
          
          {filteredResults.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-6 text-center">
              <FileImage className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Tidak ada data scan</h3>
              <p className="text-sm text-[var(--muted)]">
                {searchTerm || periodFilter !== 'all' 
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Belum ada scan retina yang dilakukan'}
              </p>
            </div>
          ) : (
            filteredResults.map((result) => (
              <div key={result.id} className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-4">
                {/* Header dengan avatar dan nama */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[var(--accent)] font-medium text-base">
                      {result.patient_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-semibold text-[var(--foreground)] mb-1">
                      {result.patient_name}
                    </h4>
                    <p className="text-xs text-[var(--muted)]">{result.patient_email}</p>
                  </div>
                </div>

                {/* Badge hasil di bawah */}
                <div className="mb-3">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${result.prediction === 'DR'
                    ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20'
                    : 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-500/20'
                  }`}>
                    {result.prediction === 'DR' ? '🔴 Diabetic Retinopathy Terdeteksi' : '✅ Retina Normal'}
                  </span>
                </div>

                {/* Info detail */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <span>📅</span>
                      <span>
                        {new Date(result.analysis_date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short', 
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {new Date(result.analysis_date).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--muted)]">Akurasi AI</span>
                    <span className="text-xs font-medium text-[var(--foreground)]">{result.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-[var(--accent)] h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <span>👨‍⚕️</span>
                    <span>Dr. {result.created_by}</span>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-3 border-t border-[var(--muted)]/10">
                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-[var(--accent)] hover:brightness-110 transition-all rounded-lg shadow-sm">
                    <Eye className="w-4 h-4" />
                    Lihat Detail Lengkap
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
