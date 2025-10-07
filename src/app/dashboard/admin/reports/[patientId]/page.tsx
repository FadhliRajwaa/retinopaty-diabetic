"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminLayout from "@/components/admin/AdminLayout";
import Image from "next/image";
import { 
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  FileImage,
  Brain,
  Zap,
  Target
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
  useEffect(() => {
    const loadPatientDetail = async () => {
      try {
        const response = await fetch(`/api/admin/scans/history?patient_id=${patientId}&limit=100`);
        const result = await response.json();
        
        if (result.ok && result.data && result.data.length > 0) {
          const scans: ScanResult[] = result.data.map((scan: {
            id: string;
            patient_id: string;
            patient_name: string;
            patient_info?: { email?: string };
            user_profiles?: { email?: string };
            image_url?: string;
            prediction: string;
            confidence: string | number;
            analysis_date?: string;
            created_at: string;
            notes?: string;
            doctor_suggestion?: string;
            manual_suggestion?: string;
            created_by?: string;
          }) => ({
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

  // Calculate progression trends
  const calculateTrend = () => {
    if (patientDetail && patientDetail.scans.length >= 2) {
      const recent = patientDetail.scans.slice(0, Math.ceil(patientDetail.scans.length / 2));
      const older = patientDetail.scans.slice(Math.ceil(patientDetail.scans.length / 2));
      
      const recentDR = recent.filter(s => s.prediction === 'DR').length / recent.length;
      const olderDR = older.filter(s => s.prediction === 'DR').length / older.length;
      
      return recentDR > olderDR ? 'worsening' : recentDR < olderDR ? 'improving' : 'stable';
    }
    return 'stable';
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

  const trend = calculateTrend();
  const avgConfidence = patientDetail.scans.reduce((sum, scan) => sum + scan.confidence, 0) / patientDetail.scans.length;

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

        {/* Advanced Stats Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Primary Stats */}
          <div className="bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">Statistik Scan</h3>
              <Activity className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted)]">Total Scan</span>
                <span className="text-xl font-bold text-[var(--foreground)]">{patientDetail.total_scans}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted)]">Rata-rata Confidence</span>
                <span className="text-xl font-bold text-[var(--accent)]">{avgConfidence.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[var(--accent)] h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${avgConfidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className={`border rounded-xl p-6 ${
            riskLevel === 'high' 
              ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-950/20 dark:to-red-900/20 dark:border-red-800/50'
              : riskLevel === 'medium'
              ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-950/20 dark:to-yellow-900/20 dark:border-yellow-800/50'
              : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/20 dark:to-green-900/20 dark:border-green-800/50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">Assessment Risiko</h3>
              {riskLevel === 'high' && <AlertTriangle className="w-6 h-6 text-red-500" />}
              {riskLevel === 'medium' && <Activity className="w-6 h-6 text-yellow-500" />}
              {riskLevel === 'low' && <CheckCircle className="w-6 h-6 text-green-500" />}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted)]">DR Terdeteksi</span>
                <span className={`text-2xl font-bold ${
                  riskLevel === 'high' ? 'text-red-600' : riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>{patientDetail.dr_detected_count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted)]">Normal</span>
                <span className="text-xl font-semibold text-green-600">{patientDetail.total_scans - patientDetail.dr_detected_count}</span>
              </div>
              <div className="pt-2">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                  riskLevel === 'high' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                    : riskLevel === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                }`}>
                  {riskLevel === 'high' ? '🚨 Risiko Tinggi' : riskLevel === 'medium' ? '⚠️ Risiko Sedang' : '✅ Risiko Rendah'}
                </span>
              </div>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 dark:from-indigo-950/20 dark:to-purple-950/20 dark:border-indigo-800/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">Analisis Tren</h3>
              <div className="flex items-center gap-2">
                {trend === 'improving' && <TrendingDown className="w-5 h-5 text-green-500" />}
                {trend === 'worsening' && <TrendingUp className="w-5 h-5 text-red-500" />}
                {trend === 'stable' && <Target className="w-5 h-5 text-blue-500" />}
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-[var(--muted)] mb-1">Status Tren</p>
                <p className={`text-lg font-semibold ${
                  trend === 'improving' ? 'text-green-600' : trend === 'worsening' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {trend === 'improving' ? '📈 Membaik' : trend === 'worsening' ? '📉 Memburuk' : '➡️ Stabil'}
                </p>
              </div>
              <div className="text-center pt-2">
                <p className="text-xs text-[var(--muted)]">Periode: {new Date(patientDetail.first_scan_date).toLocaleDateString('id-ID')} - {new Date(patientDetail.latest_scan_date).toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scan History - Visual Gallery Style */}
        <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--muted)]/20 bg-gradient-to-r from-[var(--accent)]/5 to-transparent">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Galeri Riwayat Scan ({patientDetail.scans.length})</h3>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[var(--accent)]" />
                <span className="text-sm text-[var(--muted)]">AI Analysis Timeline</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {patientDetail.scans.map((scan, index) => (
                <div key={scan.id} className={`relative rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                  scan.prediction === 'DR' 
                    ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 hover:border-red-300 dark:from-red-950/20 dark:to-red-900/30 dark:border-red-800/50'
                    : 'border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 hover:border-green-300 dark:from-green-950/20 dark:to-green-900/30 dark:border-green-800/50'
                }`}>
                  {/* Scan Number Badge */}
                  <div className="absolute -top-3 -left-3 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                      scan.prediction === 'DR' ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                      #{patientDetail.scans.length - index}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Header with Result */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                            scan.prediction === 'DR'
                              ? 'bg-red-500 text-white shadow-lg'
                              : 'bg-green-500 text-white shadow-lg'
                          }`}>
                            {scan.prediction === 'DR' ? '🔴 DR Detected' : '✅ Normal'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
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
                      
                      {/* AI Confidence Meter */}
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-[var(--accent)]" />
                          <span className="text-xs text-[var(--muted)]">AI Confidence</span>
                        </div>
                        <div className={`text-2xl font-bold ${
                          scan.confidence >= 90 ? 'text-green-600' :
                          scan.confidence >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {scan.confidence}%
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              scan.confidence >= 90 ? 'bg-green-500' :
                              scan.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${scan.confidence}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Image Preview */}
                    {scan.image_url && scan.image_url !== '/placeholder-retina.jpg' && (
                      <div className="mb-4">
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <Image 
                            src={scan.image_url} 
                            alt={`Retina Scan #${patientDetail.scans.length - index}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <div className="absolute bottom-2 left-2">
                            <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                              Scan #{patientDetail.scans.length - index}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Medical Notes */}
                    {scan.notes && (
                      <div className={`p-4 rounded-lg border ${
                        scan.prediction === 'DR' 
                          ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50'
                          : 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800/50'
                      }`}>
                        <div className="flex items-start gap-2">
                          <Target className="w-4 h-4 mt-0.5 text-[var(--accent)]" />
                          <div>
                            <p className="text-xs text-[var(--muted)] mb-1">Catatan & Saran Medis</p>
                            <p className="text-sm text-[var(--foreground)] leading-relaxed">{scan.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Analysis Metadata */}
                    <div className="mt-4 pt-4 border-t border-[var(--muted)]/20">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[var(--muted)]">Scan ID</span>
                          <p className="font-mono text-[var(--foreground)] truncate">{scan.id.substring(0, 8)}...</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)]">Analysis Time</span>
                          <p className="text-[var(--foreground)]">
                            {new Date(scan.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary Footer */}
            <div className="mt-8 p-4 bg-gradient-to-r from-[var(--accent)]/5 to-transparent rounded-lg border border-[var(--accent)]/20">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-[var(--muted)]">{patientDetail.dr_detected_count} DR Detected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-[var(--muted)]">{patientDetail.total_scans - patientDetail.dr_detected_count} Normal</span>
                  </div>
                </div>
                <div className="text-[var(--muted)]">
                  Periode: {new Date(patientDetail.first_scan_date).toLocaleDateString('id-ID')} - {new Date(patientDetail.latest_scan_date).toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
