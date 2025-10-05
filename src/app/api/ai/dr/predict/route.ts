import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime for external fetch

// Configure your Space URL and optional token
const DEFAULT_SPACE_URL = "https://FadhliRajwaa-retina-resnet50-demo.hf.space";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Field 'image' is required" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "image/jpeg";
    const b64 = buf.toString("base64");
    const dataUrl = `data:${mime};base64,${b64}`;

    const spaceUrl = process.env.HF_SPACE_URL || DEFAULT_SPACE_URL;
    const token = process.env.HF_SPACE_API_TOKEN; // optional if space is private

    // Gradio REST API v4: POST <space>/run/predict with { data: [<image_data_url>] }
    const res = await fetch(`${spaceUrl.replace(/\/$/, "")}/run/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ data: [dataUrl] }),
      // no-store to avoid caching
      cache: "no-store",
    });

    const out = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: out?.error || `Space error ${res.status}` }, { status: res.status });
    }

    // Gradio response: often { data: [ result ] }
    const raw = Array.isArray(out?.data) ? out.data[0] : out;
    // Normalize
    const predicted_class: string | undefined = raw?.predicted_class || raw?.label || raw?.class;
    let confidence: number | undefined = raw?.confidence;
    const probabilities = raw?.probabilities || raw?.probs || null;

    if (typeof confidence === "number" && confidence <= 1) confidence = confidence * 100;

    return NextResponse.json({ ok: true, result: { predicted_class, confidence, probabilities, raw } });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
