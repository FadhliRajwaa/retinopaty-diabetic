import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get user profile to get the correct ID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Load latest scan from scans or scan_results as fallback
    const safeSingle = async <T>(cb: () => Promise<{ data: T | null; error: unknown }>): Promise<T | null> => {
      try { const { data, error } = await cb(); if (error) return null; return data; } catch { return null; }
    };

    // Get latest scan from scan_results (FIXED to use patient_id)
    const latestScan = await safeSingle<NonNullable<LatestScan>>(async () =>
      supabase.from("scan_results")
        .select(`
          id,
          patient_id,
          patient_name,
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
    
    if (latestScan && latestScan.created_at && !latestScan.analysis_date) {
      latestScan.analysis_date = latestScan.created_at;
    }

    if (!latestScan) {
      return NextResponse.json({ error: "Belum ada hasil terbaru untuk diunduh" }, { status: 404 });
    }

    // Build PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
    const { width } = page.getSize();
    const margin = 48;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const drawText = (text: string, x: number, y: number, size = 12, bold = false, color = rgb(0,0,0)) => {
      page.drawText(text, { x, y, size, font: bold ? fontBold : font, color });
    };

    // Header
    let cursorY = 841.89 - margin;
    drawText("RetinaAI - Laporan Hasil Terbaru", margin, cursorY, 18, true, rgb(0.0, 0.62, 0.71));
    cursorY -= 10;
    page.drawLine({ start: { x: margin, y: cursorY }, end: { x: width - margin, y: cursorY }, thickness: 1, color: rgb(0.85,0.85,0.85) });
    cursorY -= 24;

    // Patient info
    drawText("Email Pasien:", margin, cursorY, 12, true); drawText(user.email ?? "-", margin + 110, cursorY);
    cursorY -= 18;
    const analysisAt = latestScan.analysis_date || latestScan.created_at || new Date().toISOString();
    drawText("Tanggal Analisis:", margin, cursorY, 12, true); drawText(new Date(analysisAt).toLocaleString("id-ID"), margin + 110, cursorY);
    cursorY -= 18;

    // Result box
    const boxTop = cursorY;
    const boxHeight = 120;
    page.drawRectangle({ x: margin, y: boxTop - boxHeight, width: width - margin * 2, height: boxHeight, color: rgb(0.96,0.98,1), borderWidth: 1, borderColor: rgb(0.8,0.9,0.95) });
    let innerY = boxTop - 20;
    drawText("Status Prediksi:", margin + 12, innerY, 12, true); drawText(String(latestScan.prediction ?? '-'), margin + 140, innerY, 12, true, rgb(0.0, 0.62, 0.2));
    innerY -= 18;
    drawText("Health Score:", margin + 12, innerY, 12, true); drawText(latestScan.confidence != null ? `${Math.round(latestScan.confidence)}%` : '-', margin + 140, innerY);
    innerY -= 18;
    drawText("Catatan:", margin + 12, innerY, 12, true); 
    const notes = (latestScan.notes ?? '-') as string;
    const wrap = (s: string, max = 80) => s.match(new RegExp(`.{1,${max}}`, 'g')) || [s];
    for (const line of wrap(notes)) { drawText(line, margin + 140, innerY); innerY -= 16; }

    // Footer
    drawText("Dokumen ini dihasilkan otomatis oleh RetinaAI", margin, margin, 10, false, rgb(0.45,0.45,0.45));

    const pdfBytes = await pdfDoc.save();
    const filename = `retina-report-${new Date().toISOString().slice(0,10)}.pdf`;
    // Copy into a fresh ArrayBuffer (ensures type is ArrayBuffer, not SharedArrayBuffer)
    const ab = new ArrayBuffer(pdfBytes.byteLength);
    new Uint8Array(ab).set(pdfBytes);
    return new Response(ab, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${filename}`,
        "Cache-Control": "no-store",
      }
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
