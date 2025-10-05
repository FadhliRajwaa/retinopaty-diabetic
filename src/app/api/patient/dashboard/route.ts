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

    // Latest scan (try scans, fallback scan_results)
    let latestScan = await safeSingle<NonNullable<LatestScan>>(async () =>
      supabase.from("scans")
        .select("id,user_id,image_url,prediction,confidence,analysis_date,notes")
        .eq("user_id", user.id)
        .order("analysis_date", { ascending: false })
        .limit(1)
        .maybeSingle()
    );

    if (!latestScan) {
      latestScan = await safeSingle<NonNullable<LatestScan>>(async () =>
        supabase.from("scan_results")
          .select("id,user_id,image_url,prediction,confidence,created_at,notes")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      );
      if (latestScan && latestScan.created_at && !latestScan.analysis_date) {
        latestScan.analysis_date = latestScan.created_at;
      }
    }

    // Reports list
    const reports = await safeList<Report>(async () =>
      supabase.from("reports")
        .select("id,user_id,title,summary,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
    );

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
