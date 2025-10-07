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

type ScanResultData = {
  id: string;
  prediction?: string;
  confidence?: number;
  analysis_date?: string;
  doctor_suggestion?: string;
  created_at?: string;
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get user profile to get the correct ID for scan_results
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Helper safe query: returns null/[] if table missing
    const safeSingle = async <T>(cb: () => Promise<{ data: T | null; error: unknown }>): Promise<T | null> => {
      try {
        const { data, error } = await cb();
        if (error) return null;
        return data;
      } catch {
        return null;
      }
    };

    const safeList = async <T>(cb: () => Promise<{ data: T[] | null; error: unknown }>): Promise<T[]> => {
      try {
        const { data, error } = await cb();
        if (error || !data) return [];
        return data;
      } catch {
        return [];
      }
    };

    // Latest scan from scan_results table (FIXED: use patient_id)
    const latestScan = await safeSingle<NonNullable<LatestScan>>(async () =>
      supabase.from("scan_results")
        .select(`
          id,
          patient_id,
          image_url,
          prediction,
          confidence,
          analysis_date,
          notes,
          doctor_suggestion,
          manual_suggestion,
          created_at
        `)
        .eq("patient_id", userProfile.id)  // FIXED: Use user_profiles.id
        .order("analysis_date", { ascending: false })
        .limit(1)
        .maybeSingle()
    );

    // Reports list - build from scan_results since there's no reports table
    const scanResults = await safeList<ScanResultData>(async () =>
      supabase.from("scan_results")
        .select(`
          id,
          prediction,
          confidence,
          analysis_date,
          doctor_suggestion,
          created_at
        `)
        .eq("patient_id", userProfile.id)
        .order("created_at", { ascending: false })
        .limit(10)
    );
    
    const reports: Report[] = scanResults.map((scan: ScanResultData) => ({
      id: scan.id,
      title: `Hasil Scan - ${scan.prediction}`,
      summary: `Confidence: ${scan.confidence}% - ${scan.doctor_suggestion || 'Menunggu saran dokter'}`,
      created_at: scan.created_at || scan.analysis_date
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
