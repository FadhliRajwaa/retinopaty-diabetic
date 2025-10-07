import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type LatestScan = {
  id?: string;
  user_id?: string;
  image_url?: string;
  prediction?: string;
  confidence?: number;
  analysis_date?: string;
  created_at?: string;
  notes?: string;
} | null;

type Report = {
  id: string;
  user_id?: string;
  title?: string;
  summary?: string;
  created_at?: string;
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get user profile to get correct patient ID
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Latest scan from scan_results table
    const { data: latestScanData } = await supabase
      .from("scan_results")
      .select("id,patient_id,image_url,prediction,confidence,analysis_date,created_at,notes")
      .eq("patient_id", userProfile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const latestScan: LatestScan = latestScanData ? {
      id: latestScanData.id,
      user_id: latestScanData.patient_id,
      image_url: latestScanData.image_url,
      prediction: latestScanData.prediction,
      confidence: latestScanData.confidence,
      analysis_date: latestScanData.analysis_date || latestScanData.created_at,
      created_at: latestScanData.created_at,
      notes: latestScanData.notes
    } : null;

    // Generate reports from scan_results
    const { data: recentScans } = await supabase
      .from("scan_results")
      .select("id,prediction,confidence,analysis_date,created_at,doctor_suggestion,manual_suggestion")
      .eq("patient_id", userProfile.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const reports: Report[] = (recentScans || []).map((scan, index) => ({
      id: scan.id,
      user_id: userProfile.id,
      title: `Laporan Scan #${index + 1}`,
      summary: `Hasil: ${scan.prediction}, Confidence: ${scan.confidence}% - ${scan.doctor_suggestion || scan.manual_suggestion || 'Tidak ada saran khusus'}`,
      created_at: scan.created_at
    }));

    // Activities: build from latest scan + recent reports
    const activities = [] as Array<{ id: string; title: string; description: string; time: string; type: "info"|"success"|"warning"|"error" }>;
    const fmt = (d?: string) => d ? new Date(d).toLocaleString("id-ID") : new Date().toLocaleString("id-ID");

    if (latestScan) {
      activities.push({
        id: `scan-${latestScan.id || "latest"}`,
        title: "Hasil Scan Tersedia",
        description: `Status: ${latestScan.prediction || "-"}, Confidence: ${latestScan.confidence ?? "-"}%`,
        time: fmt(latestScan.analysis_date),
        type: "success",
      });
    }

    for (const r of reports.slice(0, 5)) {
      activities.push({
        id: `report-${r.id}`,
        title: r?.title || "Laporan Kesehatan",
        description: r?.summary || "Laporan terbaru siap dilihat.",
        time: fmt(r.created_at),
        type: "info",
      });
    }

    return NextResponse.json({ latestScan, reports, activities });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
