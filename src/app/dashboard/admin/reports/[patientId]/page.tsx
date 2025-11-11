"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminLayout from "@/components/admin/AdminLayout";
import Image from "next/image";
import { 
  ArrowLeft,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Activity,
  FileImage,
  Clock,
  TrendingUp,
  TrendingDown,
  Brain,
  Zap
} from "lucide-react";

interface ApiScanResult {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_info?: { email?: string; full_name?: string };
  user_profiles?: { email?: string; full_name?: string };
  image_url?: string;
  prediction: string;
  class_id?: number;
  confidence: string | number;
  description?: string;
  severity_level?: string;
  analysis_date?: string;
  created_at: string;
  notes?: string;
  doctor_suggestion?: string;
  manual_suggestion?: string;
  created_by?: string;
}

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

  const loadPatientDetail = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/scans/history?patient_id=${patientId}&limit=100`);
      const result = await response.json();
      
      if (result.ok && result.data && result.data.length > 0) {
        const scans: ScanResult[] = result.data.map((scan: ApiScanResult) => ({
          id: scan.id,
          patient_id: scan.patient_id,
          patient_name: scan.patient_name,
          patient_email: scan.patient_info?.email || scan.user_profiles?.email || 'N/A',
          image_url: scan.image_url || '/placeholder-retina.jpg',
          prediction: scan.prediction || 'Unknown',
          class_id: scan.class_id,
          confidence: typeof scan.confidence === 'string' ? parseFloat(scan.confidence) : Number(scan.confidence || 0),
          description: scan.description,
          severity_level: scan.severity_level,
          analysis_date: scan.analysis_date || scan.created_at,
          notes: scan.notes || scan.doctor_suggestion || scan.manual_suggestion,
          created_by: scan.created_by || 'admin',
          created_at: scan.created_at,
          doctor_suggestion: scan.doctor_suggestion,
          manual_suggestion: scan.manual_suggestion
        }));

        const sortedScans = scans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        // 5-class DR detection (any class_id >= 1 or legacy DR)
        const drCount = scans.filter(scan => 
          (scan.class_id !== undefined && scan.class_id > 0) || 
          scan.prediction === 'DR' ||
          ['Mild DR', 'Moderate DR', 'Severe DR', 'Proliferative DR'].includes(scan.prediction)
        ).length;
        
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
  }, [patientId]);

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
  }, [patientId, loadPatientDetail]);


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

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Total Scan</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{patientDetail.total_scans}</p>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">Riwayat lengkap</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Risk Cases</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{patientDetail.dr_detected_count}</p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {patientDetail.total_scans > 0 ? Math.round((patientDetail.dr_detected_count / patientDetail.total_scans) * 100) : 0}% dari total
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Normal Cases</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{patientDetail.total_scans - patientDetail.dr_detected_count}</p>
                <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                  {patientDetail.total_scans > 0 ? Math.round(((patientDetail.total_scans - patientDetail.dr_detected_count) / patientDetail.total_scans) * 100) : 0}% dari total
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Scan Terakhir</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {new Date(patientDetail.latest_scan_date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short'
                  })}
                </p>
                <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                  {Math.ceil((new Date().getTime() - new Date(patientDetail.latest_scan_date).getTime()) / (1000 * 60 * 60 * 24))} hari yang lalu
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scan History with Images */}
        <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--accent)]/5 to-[var(--accent)]/10 px-6 py-6 border-b border-[var(--muted)]/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
                <Brain className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">Riwayat Analisis AI</h3>
                <p className="text-sm text-[var(--muted)]">Kronologi lengkap {patientDetail.scans.length} scan retina dengan hasil AI</p>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-[var(--muted)]/10">
            {patientDetail.scans.map((scan, index) => (
              <div key={scan.id} className="p-6 hover:bg-gradient-to-r hover:from-[var(--muted)]/3 hover:to-transparent transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* Scan Image */}
                  <div className="flex-shrink-0">
                    <div className="w-full lg:w-80 h-60 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-[var(--muted)]/20 shadow-md">
                      {scan.image_url && scan.image_url !== '/placeholder-retina.jpg' ? (
                        <Image
                          src={scan.image_url}
                          alt={`Scan retina #${patientDetail.scans.length - index}`}
                          width={320}
                          height={240}
                          className="w-full h-full object-contain bg-black/5"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-[var(--muted)]">
                            <FileImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Gambar tidak tersedia</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Scan Information */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-[var(--accent)]">#{patientDetail.scans.length - index}</span>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                            (scan.class_id === 0 || scan.prediction === 'No DR')
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                              : (scan.class_id === 1 || scan.prediction === 'Mild DR')
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                              : (scan.class_id === 2 || scan.prediction === 'Moderate DR')
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                              : (scan.class_id === 3 || scan.prediction === 'Severe DR')
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                              : (scan.class_id === 4 || scan.prediction === 'Proliferative DR')
                              ? 'bg-gradient-to-r from-red-700 to-red-800 text-white'
                              : scan.prediction === 'DR'
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                          }`}>
                            {scan.class_id === 0 || scan.prediction === 'No DR' ? '✅ No DR' :
                             scan.class_id === 1 || scan.prediction === 'Mild DR' ? '🟡 Mild DR' :
                             scan.class_id === 2 || scan.prediction === 'Moderate DR' ? '🟠 Moderate DR' :
                             scan.class_id === 3 || scan.prediction === 'Severe DR' ? '🔴 Severe DR' :
                             scan.class_id === 4 || scan.prediction === 'Proliferative DR' ? '🆘 Proliferative DR' :
                             scan.prediction === 'DR' ? '🩸 DR (Legacy)' : '❓ Unknown'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-[var(--muted)] mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            {new Date(scan.created_at).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          <span>Scan ID: {scan.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Confidence */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-[var(--foreground)]">AI Confidence Score</span>
                        <span className="text-lg font-bold text-[var(--accent)]">{scan.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            scan.confidence >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            scan.confidence >= 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          style={{ width: `${scan.confidence}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
                        <span>0%</span>
                        <span className="font-medium">
                          {scan.confidence >= 90 ? 'Sangat Akurat' :
                           scan.confidence >= 70 ? 'Akurat' : 'Perlu Verifikasi'}
                        </span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    {/* Medical Notes */}
                    {scan.notes && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <div className="p-1 bg-blue-500/10 rounded">
                            <Brain className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Saran Medis AI</h4>
                            <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">{scan.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Trend Indicator */}
                    {index < patientDetail.scans.length - 1 && (
                      <div className="mt-4 pt-4 border-t border-[var(--muted)]/10">
                        <div className="flex items-center gap-2 text-xs">
                          {scan.confidence > patientDetail.scans[index + 1].confidence ? (
                            <>
                              <TrendingUp className="w-3 h-3 text-green-600" />
                              <span className="text-green-600 font-medium">Peningkatan akurasi +{(scan.confidence - patientDetail.scans[index + 1].confidence).toFixed(1)}%</span>
                            </>
                          ) : scan.confidence < patientDetail.scans[index + 1].confidence ? (
                            <>
                              <TrendingDown className="w-3 h-3 text-red-600" />
                              <span className="text-red-600 font-medium">Penurunan akurasi -{(patientDetail.scans[index + 1].confidence - scan.confidence).toFixed(1)}%</span>
                            </>
                          ) : (
                            <span className="text-[var(--muted)]">Akurasi stabil</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
