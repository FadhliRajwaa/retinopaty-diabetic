"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  ArrowLeft,
  Calendar,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Activity,
  FileImage,
  Clock
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
  doctor_suggestion?: string;
  manual_suggestion?: string;
}

interface PatientDetail {
  patient_id: string;
  patient_name: string;
  patient_email: string;
  total_scans: number;
  dr_detected_count: number;
  latest_scan_date: string;
  first_scan_date: string;
  scans: ScanResult[];
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(null);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

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
      await loadPatientDetail();
      setLoading(false);
    };

    checkUser();
  }, [patientId]);

  const loadPatientDetail = async () => {
    try {
      const response = await fetch(`/api/admin/scans/history?patient_id=${patientId}&limit=100`);
      const result = await response.json();
      
      if (result.ok && result.data && result.data.length > 0) {
        const scans: ScanResult[] = result.data.map((scan: any) => ({
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
          created_at: scan.created_at,
          doctor_suggestion: scan.doctor_suggestion,
          manual_suggestion: scan.manual_suggestion
        }));

        const sortedScans = scans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const drCount = scans.filter(scan => scan.prediction === 'DR').length;
        
        setPatientDetail({
          patient_id: patientId,
          patient_name: sortedScans[0].patient_name,
          patient_email: sortedScans[0].patient_email,
          total_scans: scans.length,
          dr_detected_count: drCount,
          latest_scan_date: sortedScans[0].created_at,
          first_scan_date: sortedScans[sortedScans.length - 1].created_at,
          scans: sortedScans
        });
        
        console.log('[DEBUG] Loaded patient detail:', sortedScans.length, 'scans for', sortedScans[0].patient_name);
      } else {
        console.error('No scans found for patient:', patientId);
      }
    } catch (error) {
      console.error('Error loading patient detail:', error);
    }
  };

  const handleViewScan = (scan: ScanResult) => {
    setSelectedScan(scan);
  };

  const closeViewScan = () => {
    setSelectedScan(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00ADB5]/30 border-t-[#00ADB5] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-foreground">Memuat riwayat pasien...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !patientDetail) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <FileImage className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Data Pasien Tidak Ditemukan</h2>
          <p className="text-[var(--muted)] mb-4">Pasien dengan ID tersebut tidak memiliki riwayat scan.</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </AdminLayout>
    );
  }

  const riskLevel = patientDetail.dr_detected_count > 0 
    ? patientDetail.dr_detected_count / patientDetail.total_scans > 0.5 ? 'high' : 'medium'
    : 'low';

  return (
    <AdminLayout>
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors rounded-lg hover:bg-[var(--accent)]/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
                Riwayat Scan Retina
              </h1>
              <p className="text-[var(--muted)]">Detail riwayat scan pasien</p>
            </div>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                <span className="text-[var(--accent)] font-bold text-xl">
                  {patientDetail.patient_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">{patientDetail.patient_name}</h2>
                <p className="text-[var(--muted)]">{patientDetail.patient_email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    riskLevel === 'high' 
                      ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                      : riskLevel === 'medium'
                      ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                      : 'bg-green-500/10 text-green-600 border border-green-500/20'
                  }`}>
                    {riskLevel === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {riskLevel === 'medium' && <Activity className="w-3 h-3 mr-1" />}
                    {riskLevel === 'low' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {riskLevel === 'high' ? 'Risiko Tinggi' : riskLevel === 'medium' ? 'Risiko Sedang' : 'Risiko Rendah'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Total Scan</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">{patientDetail.total_scans}</p>
              </div>
              <Activity className="w-8 h-8 text-[var(--accent)]" />
            </div>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">DR Terdeteksi</p>
                <p className="text-2xl font-bold text-red-500">{patientDetail.dr_detected_count}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Scan Normal</p>
                <p className="text-2xl font-bold text-green-500">{patientDetail.total_scans - patientDetail.dr_detected_count}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Scan Terakhir</p>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {new Date(patientDetail.latest_scan_date).toLocaleDateString('id-ID')}
                </p>
              </div>
              <Clock className="w-8 h-8 text-[var(--accent)]" />
            </div>
          </div>
        </div>

        {/* Scan History */}
        <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-lg">
          <div className="px-6 py-4 border-b border-[var(--muted)]/20">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Riwayat Scan ({patientDetail.scans.length})</h3>
          </div>
          
          <div className="divide-y divide-[var(--muted)]/10">
            {patientDetail.scans.map((scan, index) => (
              <div key={scan.id} className="p-6 hover:bg-[var(--muted)]/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm text-[var(--muted)]">#{patientDetail.scans.length - index}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        scan.prediction === 'DR'
                          ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                          : 'bg-green-500/10 text-green-600 border border-green-500/20'
                      }`}>
                        {scan.prediction === 'DR' ? '🔴 DR Detected' : '✅ Normal'}
                      </span>
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        Confidence: {scan.confidence}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(scan.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {scan.notes && (
                      <div className="mt-2 text-sm text-[var(--foreground)] bg-[var(--muted)]/5 p-3 rounded-lg">
                        <strong>Catatan:</strong> {scan.notes}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleViewScan(scan)}
                    className="ml-4 p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors rounded-lg hover:bg-[var(--accent)]/10"
                    title="Lihat Detail"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--muted)]/20">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                Detail Scan #{patientDetail.scans.findIndex(s => s.id === selectedScan.id) + 1}
              </h2>
              <button 
                onClick={closeViewScan}
                className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--muted)]">Tanggal Scan</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {new Date(selectedScan.analysis_date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Hasil AI</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedScan.prediction === 'DR'
                      ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                      : 'bg-green-500/10 text-green-600 border border-green-500/20'
                  }`}>
                    {selectedScan.prediction === 'DR' ? '🔴 Diabetic Retinopathy' : '✅ Normal'}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-[var(--muted)] mb-2">Confidence Score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-[var(--accent)] h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${selectedScan.confidence}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-[var(--foreground)]">{selectedScan.confidence}%</span>
                </div>
              </div>
              
              {selectedScan.notes && (
                <div>
                  <p className="text-sm text-[var(--muted)] mb-2">Catatan & Saran Medis</p>
                  <p className="text-[var(--foreground)] leading-relaxed bg-[var(--muted)]/5 p-4 rounded-lg">
                    {selectedScan.notes}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-[var(--muted)]/20">
              <button 
                onClick={closeViewScan}
                className="px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
