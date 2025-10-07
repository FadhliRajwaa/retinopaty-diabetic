import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Types
type AdminStats = {
  totalPatients: number;
  scansToday: number;
  highRiskScans30d: number;
};

type DiagnosisStats = {
  DR: number;
  NO_DR: number;
};

type MonthlyTrendPoint = {
  month: string; // e.g. "2025-06"
  count: number;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
  source: "patient" | "scan" | "report";
  created_at: string; // for sort only
};

// Helpers
const startOfTodayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const isoMonthsBack = (months: number) => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const role = (user.user_metadata as { role?: string } | null)?.role;
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // 1) Stats
    const totalPatients = await (async () => {
      try {
        const { count } = await supabase
          .from("user_profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "patient");
        return count || 0;
      } catch {
        return 0;
      }
    })();

    const scansToday = await (async () => {
      try {
        const from = startOfTodayISO();
        const { count } = await supabase
          .from("scan_results")
          .select("id", { count: "exact", head: true })
          .gte("created_at", from);
        return count || 0;
      } catch {
        return 0;
      }
    })();

    const highRiskScans30d = await (async () => {
      try {
        const from = isoMonthsBack(1); // ~30 hari kebelakang
        // asumsi high risk = prediction == 'DR'
        const { count } = await supabase
          .from("scan_results")
          .select("id", { count: "exact", head: true })
          .eq("prediction", "DR")
          .gte("created_at", from);
        return count || 0;
      } catch {
        return 0;
      }
    })();

    const stats: AdminStats = { totalPatients, scansToday, highRiskScans30d };

    // 2) Diagnosis stats (30d)
    const diagnosisStats: DiagnosisStats = await (async () => {
      const from = isoMonthsBack(1);
      let DR = 0; let NO_DR = 0;
      try {
        const { data, error } = await supabase
          .from("scan_results")
          .select("prediction, created_at")
          .gte("created_at", from)
          .limit(2000);
        if (!error && data) {
          for (const r of data as Array<{ prediction?: string }>) {
            if (r.prediction === "DR") DR++; else NO_DR++;
          }
        }
      } catch {}
      return { DR, NO_DR };
    })();

    // 3) Monthly trend patients (last 6 months)
    const monthlyTrend: MonthlyTrendPoint[] = await (async () => {
      try {
        const from = isoMonthsBack(5); // dari 5 bulan lalu sampai sekarang (6 titik termasuk bulan ini)
        const { data } = await supabase
          .from("user_profiles")
          .select("created_at")
          .eq("role", "patient")
          .gte("created_at", from)
          .order("created_at", { ascending: true });
        const buckets = new Map<string, number>();
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        if (data) {
          for (const r of data as Array<{ created_at: string }>) {
            const d = new Date(r.created_at);
            const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
            buckets.set(key, (buckets.get(key) || 0) + 1);
          }
        }
        // Ensure 6 buckets
        const points: MonthlyTrendPoint[] = [];
        const now = new Date();
        now.setDate(1); now.setHours(0,0,0,0);
        for (let i = 5; i >= 0; i--) {
          const dt = new Date(now);
          dt.setMonth(now.getMonth() - i);
          const key = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`;
          points.push({ month: key, count: buckets.get(key) || 0 });
        }
        return points;
      } catch {
        return [];
      }
    })();

    // 4) Recent activities (last 20)
    const activities: ActivityItem[] = await (async () => {
      const items: ActivityItem[] = [];
      try {
        const { data } = await supabase
          .from("user_profiles")
          .select("id, full_name, email, created_at, role")
          .order("created_at", { ascending: false })
          .limit(10);
        if (data) {
          for (const r of data as Array<{ id: string; full_name?: string; email: string; created_at: string; role?: string }>) {
            if (r.role === 'patient') {
              items.push({
                id: `patient-${r.id}`,
                title: "Pasien Baru Terdaftar",
                description: r.full_name || r.email,
                time: new Date(r.created_at).toLocaleString('id-ID'),
                type: "success",
                source: "patient",
                created_at: r.created_at,
              });
            }
          }
        }
      } catch {}
      // Get scan results from scan_results table
      try {
        const { data } = await supabase
          .from("scan_results")
          .select("id, created_at, prediction, confidence, patient_name")
          .order("created_at", { ascending: false })
          .limit(10);
        if (data) {
          for (const r of data as Array<{ id: string; created_at: string; prediction?: string; confidence?: number; patient_name?: string }>) {
            items.push({
              id: `scan-${r.id}`,
              title: "Hasil Scan Diterima",
              description: `Pasien: ${r.patient_name || 'N/A'} | Prediksi: ${r.prediction ?? '-'} | Conf: ${r.confidence ?? '-'}%`,
              time: new Date(r.created_at).toLocaleString('id-ID'),
              type: r.prediction === 'DR' ? 'warning' : 'info',
              source: "scan",
              created_at: r.created_at,
            });
          }
        }
      } catch {}
      // This section is now redundant since we already handle scan_results above
      // Generate report activities from recent scans with suggestions
      try {
        const { data } = await supabase
          .from("scan_results")
          .select("id, created_at, doctor_suggestion, manual_suggestion, patient_name")
          .not("doctor_suggestion", "is", null)
          .order("created_at", { ascending: false })
          .limit(5);
        if (data) {
          for (const r of data as Array<{ id: string; created_at: string; doctor_suggestion?: string; manual_suggestion?: string; patient_name?: string }>) {
            const suggestion = r.manual_suggestion || r.doctor_suggestion;
            if (suggestion) {
              items.push({
                id: `report-${r.id}`,
                title: 'Saran Medis Diberikan',
                description: `Pasien: ${r.patient_name || 'N/A'} - ${suggestion.substring(0, 50)}...`,
                time: new Date(r.created_at).toLocaleString('id-ID'),
                type: 'info',
                source: 'report',
                created_at: r.created_at,
              });
            }
          }
        }
      } catch {}
      // sort by created_at desc and limit 20
      items.sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
      return items.slice(0, 20);
    })();

    return NextResponse.json({ stats, diagnosisStats, monthlyTrend, activities, updatedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
