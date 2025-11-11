import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime for external fetch

// Configure your Space URL for 5-class DenseNet201 model
const DEFAULT_SPACE_URL = "https://FadhliRajwaa-DiabeticRetinopathy.hf.space";

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

    // FastAPI endpoint
    const url = `${spaceUrl}/predict`;
    
    // Create FormData for FastAPI
    const formData = new FormData();
    const blob = new Blob([buf], { type: mime });
    formData.append('file', blob, file.name);  // FastAPI expects 'file' not 'image'
    
    console.log(`[DEBUG] Calling: ${url}`);
    console.log(`[DEBUG] File size: ${buf.length} bytes, type: ${mime}`);
    
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      cache: "no-store",
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout for HuggingFace Space
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error(`[ERROR] HuggingFace API error ${res.status}:`, errorText);
      return NextResponse.json(
        { ok: false, error: `HuggingFace API error ${res.status}: ${errorText}` },
        { status: res.status }
      );
    }
    
    const out = await res.json();
    
    // New FastAPI response format for 5-class model: { success: true, prediction: { ... }, all_probabilities: { ... }, metadata: { ... } }
    if (!out.success) {
      return NextResponse.json(
        { ok: false, error: out.error || 'FastAPI returned error' },
        { status: 500 }
      );
    }
    
    const prediction = out.prediction;
    const allProbabilities = out.all_probabilities;
    const metadata = out.metadata;
    
    // Map 5-class results to frontend format
    return NextResponse.json({ 
      ok: true, 
      result: {
        // Main prediction
        predicted_class: prediction.class_name,
        class_id: prediction.class_id,
        confidence: prediction.confidence,
        description: prediction.description,
        severity_level: prediction.severity_level,
        
        // All class probabilities
        probabilities: allProbabilities,
        
        // Model metadata
        model_info: {
          name: metadata.model,
          version: metadata.version,
          total_classes: metadata.total_classes,
          filename: metadata.filename
        },
        
        // Legacy compatibility (for existing frontend)
        raw_sigmoid: Object.values(allProbabilities)
      } 
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    console.error('[ERROR] API route error:', {
      message,
      name: e instanceof Error ? e.name : 'Unknown',
      stack: e instanceof Error ? e.stack : undefined,
      url: `${process.env.HF_SPACE_URL || DEFAULT_SPACE_URL}/predict`
    });
    
    // Handle specific error types
    if (e instanceof Error) {
      if (e.name === 'AbortError') {
        return NextResponse.json({ ok: false, error: 'Request timeout - HuggingFace Space took too long to respond' }, { status: 504 });
      }
      if (e.message.includes('fetch failed')) {
        return NextResponse.json({ ok: false, error: 'Network error - Cannot reach HuggingFace Space' }, { status: 502 });
      }
    }
    
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
