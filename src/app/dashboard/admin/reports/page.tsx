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
  prediction: string;
  class_id?: number;
  confidence: number;
  description?: string;
  severity_level?: string;
  analysis_date: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

interface PatientSummary {
  patient_id: string;
  patient_name: string;
  patient_email: string;
  scan_count: number;
  latest_scan_date: string;
  latest_prediction: string;
  latest_class_id?: number;
  latest_confidence: number;
  has_dr_detected: boolean;
  scans: ScanResult[];
}

interface ApiScanResult {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_info?: { email?: string; full_name?: string };
  user_profiles?: { email?: string; full_name?: string };
  image_url?: string;
  prediction: string;
  confidence: string | number;
  analysis_date?: string;
  created_at: string;
  notes?: string;
  doctor_suggestion?: string;
  manual_suggestion?: string;
  created_by?: string;
}

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [patientSummaries, setPatientSummaries] = useState<PatientSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('');

  const loadScanResults = async () => {
    try {
      // Fetch REAL data from scan_results table via API
      const response = await fetch('/api/admin/scans/history?limit=100');
      const result = await response.json();
      
      if (result.ok && result.data) {
        // Transform data to match interface
        const transformedData: ScanResult[] = result.data.map((scan: ApiScanResult) => ({
          id: scan.id,
          patient_id: scan.patient_id,
          patient_name: scan.patient_name,
          patient_email: scan.patient_info?.email || scan.user_profiles?.email || 'N/A',
          image_url: scan.image_url || '/placeholder-retina.jpg',
          prediction: scan.prediction as 'DR' | 'NO_DR',
          confidence: typeof scan.confidence === 'string' ? parseFloat(scan.confidence) : Number(scan.confidence || 0),
          analysis_date: scan.analysis_date || scan.created_at,
          notes: scan.notes || scan.doctor_suggestion || scan.manual_suggestion,
          created_by: scan.created_by || 'admin',
          created_at: scan.created_at
        }));
        
        setScanResults(transformedData);
        
        // Group by patient
        const patientGroups = transformedData.reduce((groups, scan) => {
          const key = scan.patient_id;
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(scan);
          return groups;
        }, {} as Record<string, ScanResult[]>);
        
        // Create patient summaries
        const summaries: PatientSummary[] = Object.values(patientGroups).map(scans => {
          const sortedScans = scans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          const latestScan = sortedScans[0];
          // Check if any scan detected DR (class_id > 0 or old DR prediction)
          const hasDR = scans.some(scan => 
            (scan.class_id !== undefined && scan.class_id > 0) || 
            scan.prediction === 'DR' || 
            (scan.prediction !== 'No DR' && scan.prediction !== 'Normal')
          );
          
          return {
            patient_id: latestScan.patient_id,
            patient_name: latestScan.patient_name,
            patient_email: latestScan.patient_email,
            scan_count: scans.length,
            latest_scan_date: latestScan.created_at,
            latest_prediction: latestScan.prediction,
            latest_class_id: latestScan.class_id,
            latest_confidence: latestScan.confidence,
            has_dr_detected: hasDR,
            scans: sortedScans
          };
        }).sort((a, b) => new Date(b.latest_scan_date).getTime() - new Date(a.latest_scan_date).getTime());
        
        setPatientSummaries(summaries);
        console.log('[DEBUG] Loaded patient summaries:', summaries.length, 'patients');
      } else {
        console.error('Failed to load scan results:', result.error);
        setScanResults([]);
      }
    } catch (error) {
      console.error('Error loading scan results:', error);
      setScanResults([]);
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

    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      if (!loading) {
        loadScanResults();
      }
    }, 30000);

    // Refresh when window gains focus (user comes back to tab)
    const handleFocus = () => {
      if (!loading) {
        loadScanResults();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loading]);

  const handleViewDetail = (patientId: string) => {
    // Navigate to patient detail page
    window.location.href = `/dashboard/admin/reports/${patientId}`;
  };

  const filteredResults = patientSummaries.filter(patient => {
    const matchesSearch = patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patient_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesPeriod = true;
    if (periodFilter !== 'all') {
      const resultDate = new Date(patient.latest_scan_date);
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
  const activePatients = patientSummaries.length;

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
                  Jumlah Scan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Scan Terakhir
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Status Terbaru
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--muted)]/10">
              {filteredResults.map((patient) => (
                <tr key={patient.patient_id} className="hover:bg-[var(--muted)]/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-[var(--accent)] font-medium text-sm">
                          {patient.patient_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-[var(--foreground)]">{patient.patient_name}</span>
                        <p className="text-xs text-[var(--muted)]">{patient.patient_email}</p>
                        {patient.has_dr_detected && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-800 mt-1">
                            ⚠️ DR Detected
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <span className="text-2xl font-bold text-[var(--accent)]">{patient.scan_count}</span>
                      <p className="text-xs text-[var(--muted)]">kali scan</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted)]">
                    {new Date(patient.latest_scan_date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                      (patient.latest_class_id === 0 || patient.latest_prediction === 'No DR')
                        ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-500/20'
                        : patient.latest_class_id === 1
                        ? 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-500/20'
                        : patient.latest_class_id === 2
                        ? 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-500/20'
                        : (patient.latest_class_id && patient.latest_class_id >= 3) || patient.latest_prediction === 'DR'
                        ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20'
                        : 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-500/20'
                    }`}>
                      {patient.latest_prediction || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                    {patient.latest_confidence}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetail(patient.patient_id)}
                        className="p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors rounded-lg hover:bg-[var(--accent)]/10"
                        title="Lihat Riwayat Lengkap"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileImage className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Tidak ada data pasien</h3>
                    <p className="text-[var(--muted)]">
                      {searchTerm || periodFilter !== 'all' 
                        ? 'Coba ubah filter atau kata kunci pencarian'
                        : 'Belum ada pasien yang melakukan scan retina'}
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
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Riwayat Pasien</h3>
            <p className="text-sm text-[var(--muted)] mt-1">{filteredResults.length} pasien</p>
          </div>
          
          {filteredResults.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-6 text-center">
              <FileImage className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Tidak ada data pasien</h3>
              <p className="text-sm text-[var(--muted)]">
                {searchTerm || periodFilter !== 'all' 
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Belum ada pasien yang melakukan scan retina'}
              </p>
            </div>
          ) : (
            filteredResults.map((patient) => (
              <div key={patient.patient_id} className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-4">
                {/* Header dengan avatar dan nama */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[var(--accent)] font-medium text-base">
                      {patient.patient_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-semibold text-[var(--foreground)] mb-1">
                      {patient.patient_name}
                    </h4>
                    <p className="text-xs text-[var(--muted)]">{patient.patient_email}</p>
                    {patient.has_dr_detected && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-800 mt-1">
                        ⚠️ DR Detected
                      </span>
                    )}
                  </div>
                </div>

                {/* Scan Count */}
                <div className="mb-3">
                  <div className="text-center p-3 bg-[var(--accent)]/5 rounded-lg">
                    <div className="text-2xl font-bold text-[var(--accent)]">{patient.scan_count}</div>
                    <div className="text-xs text-[var(--muted)]">Total Scan</div>
                  </div>
                </div>

                {/* Latest Result */}
                <div className="mb-3">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                    patient.latest_prediction === 'DR'
                      ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20'
                      : 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-500/20'
                  }`}>
                    {patient.latest_prediction === 'DR' ? '🔴 DR Terdeteksi (Terbaru)' : '✅ Normal (Terbaru)'}
                  </span>
                </div>

                {/* Latest Scan Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <span>📅</span>
                      <span>Scan Terakhir</span>
                    </div>
                    <div className="text-xs text-[var(--foreground)]">
                      {new Date(patient.latest_scan_date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short', 
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--muted)]">Confidence Terbaru</span>
                    <span className="text-xs font-medium text-[var(--foreground)]">{patient.latest_confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-[var(--accent)] h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${patient.latest_confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-3 border-t border-[var(--muted)]/10">
                  <button 
                    onClick={() => handleViewDetail(patient.patient_id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-[var(--accent)] hover:brightness-110 transition-all rounded-lg shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat Riwayat Lengkap
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
