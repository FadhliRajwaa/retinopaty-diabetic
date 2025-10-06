"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  ScanLine,
  Upload,
  Brain,
  FileCheck,
  Plus,
  ArrowRight,
  Check,
  Clock,
  AlertTriangle,
  Users,
  ChevronDown,
  X,
  Save,
  Search,
  FileImage
} from "lucide-react";

interface Patient {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
}

interface ScanResult {
  id?: string;
  patient_id: string;
  patient_name: string;
  image_url: string;
  prediction: 'DR' | 'NO_DR';
  confidence: number;
  analysis_date: string;
  notes?: string;
}

export default function ScansPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScanResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notes, setNotes] = useState('');
  const [manualSuggestion, setManualSuggestion] = useState('');
  const [autoSuggestion, setAutoSuggestion] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/auth/login?next=/dashboard/admin/scans";
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

    const fetchRecentScans = async () => {
      try {
        const response = await fetch("/api/admin/scans/history?limit=5");
        const result = await response.json();
        if (result.ok) {
          setRecentScans(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching recent scans:", error);
      }
    };

    checkUser();
    fetchRecentScans();
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'patient')
        .eq('status', 'approved')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDropdown(false);
    setPatientSearch('');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setCurrentStep(2);
    }
  };

  const startAnalysis = async () => {
    if (!uploadedImage || !selectedPatient) return;
    setIsAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append('image', uploadedImage);
      const res = await fetch('/api/ai/dr/predict', {
        method: 'POST',
        body: fd,
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Gagal menganalisis gambar');

      const raw = data.result || {};
      const pred = String(raw.predicted_class || '').toUpperCase();
      const prediction: 'DR' | 'NO_DR' = pred === 'DR' ? 'DR' : 'NO_DR';
      const confRaw = typeof raw.confidence === 'number' ? raw.confidence : 0;
      const confidence = Math.round(confRaw * 100) / 100; // tampil 2 desimal

      const result: ScanResult = {
        patient_id: selectedPatient.id,
        patient_name: selectedPatient.full_name || selectedPatient.email,
        image_url: imagePreview || '',
        prediction,
        confidence,
        analysis_date: new Date().toISOString(),
        notes: undefined,
      };

      // Generate automatic doctor suggestion
      let suggestion = "";
      if (prediction === "DR") {
        if (confidence >= 90) {
          suggestion = "Rujuk segera ke dokter mata spesialis retina. Kemungkinan besar terdapat diabetic retinopathy yang memerlukan penanganan segera.";
        } else if (confidence >= 70) {
          suggestion = "Disarankan untuk konsultasi ke dokter mata. Hasil menunjukkan kemungkinan diabetic retinopathy.";
        } else {
          suggestion = "Perlu pemeriksaan lebih lanjut. Hasil tidak conclusive, sebaiknya konsultasi dengan dokter mata.";
        }
      } else { // NO_DR
        if (confidence >= 90) {
          suggestion = "Kondisi retina terlihat normal. Tetap jaga kontrol gula darah dan pemeriksaan rutin setiap 6-12 bulan.";
        } else if (confidence >= 70) {
          suggestion = "Kemungkinan besar kondisi retina normal, namun tetap disarankan kontrol rutin setiap 6 bulan.";
        } else {
          suggestion = "Hasil tidak conclusive. Disarankan pemeriksaan ulang atau konsultasi dengan dokter mata.";
        }
      }
      
      setAutoSuggestion(suggestion);
      setAnalysisResult(result);
      setCurrentStep(3);
    } catch (err) {
      console.error('AI analysis failed:', err);
      alert('Gagal menganalisis gambar. Coba lagi.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveScanResult = async () => {
    if (!analysisResult) return;
    
    setIsSaving(true);
    try {
      const payload = {
        patient_id: analysisResult.patient_id,
        patient_name: analysisResult.patient_name,
        image_url: analysisResult.image_url,
        prediction: analysisResult.prediction,
        confidence: analysisResult.confidence,
        analysis_date: analysisResult.analysis_date,
        notes: notes.trim() || null,
        manual_suggestion: manualSuggestion.trim() || null
      };
      
      const response = await fetch('/api/admin/scans/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Gagal menyimpan hasil scan');
      }
      
      alert('Hasil scan berhasil disimpan!');
      // Refresh recent scans
      const response = await fetch("/api/admin/scans/history?limit=5");
      const result = await response.json();
      if (result.ok) {
        setRecentScans(result.data || []);
      }
      resetScan();
    } catch (error) {
      console.error('Error saving scan:', error);
      alert(`Gagal menyimpan hasil scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const resetScan = () => {
    setCurrentStep(1);
    setSelectedPatient(null);
    setUploadedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setNotes('');
    setManualSuggestion('');
    setAutoSuggestion('');
  };

  const filteredPatients = patients.filter(patient => 
    patient.full_name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.email.toLowerCase().includes(patientSearch.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00ADB5]/30 border-t-[#00ADB5] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-foreground">Memuat scan retina...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) return null;

  const steps = [
    { 
      number: 1, 
      title: "Pilih Pasien", 
      description: "Pilih pasien yang akan di-scan",
      icon: Users,
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending'
    },
    { 
      number: 2, 
      title: "Upload & Analisis", 
      description: "Upload gambar dan analisis AI",
      icon: Brain,
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'
    },
    { 
      number: 3, 
      title: "Hasil & Simpan", 
      description: "Review hasil dan simpan data",
      icon: FileCheck,
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending'
    }
  ];

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-5 h-5 text-white" />;
      case 'active':
        return <Clock className="w-5 h-5 text-white" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-white" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'active':
        return 'bg-[var(--accent)]';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <AdminLayout>
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--foreground)] mb-1 sm:mb-2">
                Scan Retina
              </h1>
              <p className="text-[var(--muted)] text-sm sm:text-base lg:text-lg">
                Workflow pilih pasien → upload → analisis AI → hasil
              </p>
            </div>
            <button
              onClick={resetScan}
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-colors text-sm sm:text-base shrink-0"
            >
              <Plus className="w-4 h-4" />
              Scan Baru
            </button>
          </div>
        </div>

        {/* Progress Steps - Responsive */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-6 shadow-sm animate-fade-in hover-lift">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">Progress Workflow</h3>
            
            {/* Desktop: Horizontal, Mobile: Vertical */}
            <div className="hidden md:flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex-1 relative animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="flex flex-col items-center">
                    {/* Step Circle */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getStepColor(step.status)} shadow-lg transition-all duration-300 ${step.status === 'active' ? 'ring-4 ring-[var(--accent)]/20 scale-110' : ''}`}>
                      {getStepIcon(step.status)}
                    </div>
                    
                    {/* Step Info */}
                    <div className="mt-3 text-center">
                      <p className="text-sm font-semibold text-[var(--foreground)] mb-1">{step.title}</p>
                      <p className="text-xs text-[var(--muted)] max-w-[140px]">{step.description}</p>
                      {step.status === 'active' && (
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                          <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></div>
                          <span className="text-xs text-[var(--accent)] font-medium">Aktif</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-7 left-[calc(50%+28px)] right-[-50%] h-0.5 bg-[var(--muted)]/20">
                      <div className={`h-full transition-all duration-500 ${
                        steps[index + 1].status === 'completed' || steps[index + 1].status === 'active'
                          ? 'bg-[var(--accent)] w-full'
                          : 'bg-transparent w-0'
                      }`}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Mobile: Vertical */}
            <div className="md:hidden space-y-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-start gap-4 animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStepColor(step.status)} shrink-0 shadow-md ${step.status === 'active' ? 'ring-4 ring-[var(--accent)]/20' : ''}`}>
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-base font-semibold text-[var(--foreground)] mb-1">{step.title}</p>
                    <p className="text-sm text-[var(--muted)]">{step.description}</p>
                    {step.status === 'active' && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></div>
                        <span className="text-xs text-[var(--accent)] font-medium">Sedang Aktif</span>
                      </div>
                    )}
                    {step.status === 'completed' && (
                      <div className="flex items-center gap-1.5 mt-2 text-green-500">
                        <Check className="w-3 h-3" />
                        <span className="text-xs font-medium">Selesai</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="space-y-8">
          {/* Step 1: Patient Selection */}
          {currentStep === 1 && (
            <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-8 shadow-sm animate-scale-in hover-lift">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Pilih Pasien</h3>
                  <p className="text-sm text-[var(--muted)] mt-0.5">Cari dan pilih pasien untuk scan retina</p>
                </div>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Cari pasien berdasarkan nama atau email..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    onFocus={() => setShowPatientDropdown(true)}
                    className={`w-full pl-10 pr-4 py-3 border border-[var(--muted)]/30 bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 rounded-xl ${showPatientDropdown ? 'rounded-b-none border-b-0' : ''}`}
                  />
                  <ChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)] cursor-pointer"
                    onMouseDown={(e) => { e.preventDefault(); setShowPatientDropdown((v) => !v); }}
                  />
                  {showPatientDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-0 z-20 bg-[var(--surface)] border border-[var(--muted)]/30 border-t-0 rounded-b-xl rounded-t-none shadow-lg max-h-60 overflow-y-auto animate-dropdown ring-1 ring-[var(--accent)]/15 scrollbar-thin">
                      {filteredPatients.length > 0 ? (
                        <div className="divide-y divide-[var(--muted)]/10">
                          {filteredPatients.map((patient) => (
                            <button
                              key={patient.id}
                              onClick={() => handlePatientSelect(patient)}
                              className="w-full px-4 py-3 text-left hover:bg-[var(--muted)]/5"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                                  <span className="text-[var(--accent)] text-sm font-medium">
                                    {patient.full_name?.charAt(0).toUpperCase() || patient.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-[var(--foreground)]">{patient.full_name || 'Nama tidak tersedia'}</p>
                                  <p className="text-sm text-[var(--muted)]">{patient.email}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-6 py-6 text-center text-sm text-[var(--muted)] flex items-center justify-center gap-2">
                          <Users className="w-4 h-4 opacity-70" />
                          <span>Tidak ada pasien ditemukan</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {selectedPatient && (
                  <div className="mt-4 p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--accent)]/20 rounded-full flex items-center justify-center">
                          <span className="text-[var(--accent)] font-medium">
                            {selectedPatient.full_name?.charAt(0).toUpperCase() || selectedPatient.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{selectedPatient.full_name || 'Nama tidak tersedia'}</p>
                          <p className="text-sm text-[var(--muted)]">{selectedPatient.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="p-1 hover:bg-[var(--muted)]/10 rounded-lg"
                      >
                        <X className="w-4 h-4 text-[var(--muted)]" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* dropdown moved inside input container for better alignment */}
                
                {selectedPatient && (
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--accent)] text-white rounded-xl hover:brightness-110 transition-all shadow-md font-semibold text-base active:scale-[.98]"
                  >
                    Lanjut ke Upload Gambar
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Upload & Analysis */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {/* Upload Section */}
              <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-8 shadow-sm animate-scale-in hover-lift">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--foreground)]">Upload Gambar</h3>
                    <p className="text-sm text-[var(--muted)] mt-0.5">Unggah foto retina pasien</p>
                  </div>
                </div>
                
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-[var(--accent)]/30 rounded-xl p-12 text-center bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10 transition-colors animate-fade-in">
                    <FileImage className="w-16 h-16 text-[var(--accent)] mx-auto mb-4" />
                    <p className="text-[var(--foreground)] font-medium mb-2">Drag & drop gambar di sini</p>
                    <p className="text-[var(--muted)] text-sm mb-6">atau klik tombol di bawah untuk memilih file</p>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-semibold hover:brightness-110 transition-all cursor-pointer shadow-md"
                    >
                      <Upload className="w-5 h-5" />
                      Pilih Gambar
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="relative h-64 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-scale-in">
                      <Image
                        src={imagePreview || ''}
                        alt="Preview retina scan"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setUploadedImage(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={startAnalysis}
                      disabled={isAnalyzing}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--accent)] text-white rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[.98]"
                    >
                      <Brain className="w-5 h-5" />
                      {isAnalyzing ? 'Menganalisis...' : 'Mulai Analisis AI'}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Analysis Section */}
              <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-8 shadow-sm animate-scale-in hover-lift">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--foreground)]">Analisis AI</h3>
                    <p className="text-sm text-[var(--muted)] mt-0.5">Proses deteksi otomatis</p>
                  </div>
                </div>
                
                {isAnalyzing ? (
                  <div className="text-center py-12 bg-[var(--accent)]/5 rounded-xl animate-fade-in">
                    <div className="h-1 shimmer rounded-full mb-6" />
                    <div className="w-20 h-20 border-4 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-[var(--foreground)] font-semibold mb-2 text-lg">AI sedang menganalisis gambar...</p>
                    <p className="text-[var(--muted)]">Estimasi: 30-60 detik</p>
                    <div className="mt-6 max-w-xs mx-auto">
                      <div className="h-2 bg-[var(--muted)]/20 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent)] rounded-full animate-pulse" style={{width: '70%'}}></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Brain className="w-16 h-16 text-[var(--muted)] mx-auto mb-4 opacity-50" />
                    <p className="text-[var(--muted)] font-medium">Upload gambar untuk memulai analisis</p>
                    <p className="text-sm text-[var(--muted)] mt-2">AI akan mendeteksi diabetic retinopathy</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Results & Save */}
          {currentStep === 3 && analysisResult && (
            <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-8 shadow-sm animate-scale-in hover-lift">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Hasil Analisis & Simpan</h3>
                  <p className="text-sm text-[var(--muted)] mt-0.5">Review hasil dan tambahkan catatan</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                {/* Results */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10 p-6 rounded-xl border border-[var(--accent)]/20 animate-slide-up hover-lift">
                    <h4 className="font-bold text-[var(--foreground)] mb-6 text-lg">Hasil Diagnosa</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--muted)]">Pasien:</span>
                        <span className="font-medium text-[var(--foreground)]">{analysisResult.patient_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--muted)]">Prediksi:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          analysisResult.prediction === 'DR' 
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            : 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                        }`}>
                          {analysisResult.prediction === 'DR' ? 'Diabetic Retinopathy' : 'Normal'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--muted)]">Confidence:</span>
                        <span className="font-medium text-[var(--foreground)]">{analysisResult.confidence}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--muted)]">Tanggal:</span>
                        <span className="text-[var(--foreground)]">{new Date(analysisResult.analysis_date).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {imagePreview && (
                    <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                      <h4 className="font-semibold text-[var(--foreground)] mb-3">Gambar Scan</h4>
                      <div className="relative h-48 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-scale-in">
                        <Image
                          src={imagePreview || ''}
                          alt="Retina scan"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Notes & Suggestions */}
                <div className="space-y-6 animate-slide-up" style={{ animationDelay: '120ms' }}>
                  {/* Auto Suggestion */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Saran AI
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                      {autoSuggestion}
                    </p>
                  </div>
                  
                  {/* Manual Suggestion Override */}
                  <div>
                    <label className="block text-base font-semibold text-[var(--foreground)] mb-3">Saran Dokter (Manual - Opsional)</label>
                    <textarea
                      value={manualSuggestion}
                      onChange={(e) => setManualSuggestion(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                      placeholder="Override saran AI dengan rekomendasi manual dari dokter..."
                    />
                    <p className="text-xs text-[var(--muted)] mt-1">Jika kosong, akan menggunakan saran AI di atas</p>
                  </div>
                  
                  <div>
                    <label className="block text-base font-semibold text-[var(--foreground)] mb-3">Catatan Tambahan (Opsional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-[var(--muted)]/30 rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                      placeholder="Tambahkan catatan atau observasi tambahan..."
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={saveScanResult}
                      disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--accent)] text-white rounded-xl hover:brightness-110 transition-all shadow-md font-semibold text-base active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-5 h-5" />
                      {isSaving ? 'Menyimpan...' : 'Simpan Hasil Scan'}
                    </button>
                    <button
                      onClick={resetScan}
                      className="w-full px-6 py-3 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/5 rounded-xl transition-all font-medium active:scale-[.98]"
                    >
                      Mulai Scan Baru
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Scans */}
        <div className="mt-8">
          <div className="bg-[var(--surface)] border border-[var(--muted)]/20 rounded-xl p-6 animate-fade-in hover-lift">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Scan Terbaru</h3>
            
            {recentScans.length === 0 ? (
              <div className="text-center py-12">
                <ScanLine className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                <h4 className="text-lg font-medium text-[var(--foreground)] mb-2">Belum ada scan</h4>
                <p className="text-[var(--muted)]">Mulai dengan mengupload scan retina pertama</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentScans.map((scan, index) => (
                  <div key={scan.id} className="flex items-center gap-4 p-4 bg-[var(--muted)]/5 rounded-lg border border-[var(--muted)]/10 hover:bg-[var(--muted)]/10 transition-colors">
                    <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center">
                      <ScanLine className="w-6 h-6 text-[var(--accent)]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--foreground)]">{scan.patient_name}</h4>
                      <div className="flex items-center gap-4 text-sm text-[var(--muted)] mt-1">
                        <span>{new Date(scan.created_at).toLocaleDateString('id-ID')}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          scan.prediction === 'DR' 
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'bg-green-500/10 text-green-600 dark:text-green-400'
                        }`}>
                          {scan.prediction === 'DR' ? 'DR' : 'Normal'}
                        </span>
                        <span>{scan.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <button 
                    className="text-[var(--accent)] hover:text-[var(--accent)]/80 font-medium text-sm"
                    onClick={() => window.location.href = '/dashboard/admin/history'}
                  >
                    Lihat Semua Riwayat →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
