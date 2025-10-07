import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime for external fetch

// Configure your Space URL and optional token
const DEFAULT_SPACE_URL = "https://FadhliRajwaa-retinai.hf.space";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Field 'image' is required" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "image/jpeg";

    const spaceUrl = (process.env.HF_SPACE_URL || DEFAULT_SPACE_URL).replace(/\/$/, "");

    // Flask API endpoint
    const url = `${spaceUrl}/predict`;
    
    // Create FormData for Flask
    const formData = new FormData();
    const blob = new Blob([buf], { type: mime });
    formData.append('image', blob, file.name);
    
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { ok: false, error: `Flask API error ${res.status}: ${errorText}` },
        { status: res.status }
      );
    }
    
    const out = await res.json();
    
    // FastAPI response format: { ok: true, result: { predicted_class, confidence, probabilities, ... } }
    if (!out.ok) {
      return NextResponse.json(
        { ok: false, error: out.error || 'FastAPI returned error' },
        { status: 500 }
      );
    }
    
    const result = out.result;
    
    return NextResponse.json({ 
      ok: true, 
      result: {
        predicted_class: result.predicted_class,
        confidence: result.confidence,
        probabilities: result.probabilities,
        raw_sigmoid: result.raw_sigmoid,
        processing_time_ms: result.processing_time_ms
      } 
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
