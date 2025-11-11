import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime for external fetch
export const dynamic = 'force-dynamic'; // disable caching for dynamic predictions

// Configure your Space URL for 5-class DenseNet201 model
const DEFAULT_SPACE_URL = "https://FadhliRajwaa-DiabeticRetinopathy.hf.space";

// Environment-specific configurations
const getConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    timeout: isProduction ? 60000 : 45000, // Production: 60s, Dev: 45s
    retries: isProduction ? 2 : 1,
    spaceUrl: process.env.HF_SPACE_URL || DEFAULT_SPACE_URL,
    isDevelopment,
    isProduction
  };
};

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Field 'image' is required" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "image/jpeg";

    const config = getConfig();
    const spaceUrl = config.spaceUrl.replace(/\/$/, "");

    // FastAPI endpoint
    const url = `${spaceUrl}/predict`;
    
    // Create FormData for FastAPI
    const formData = new FormData();
    const blob = new Blob([buf], { type: mime });
    formData.append('file', blob, file.name);  // FastAPI expects 'file' not 'image'
    
    console.log(`[DEBUG] Environment: ${config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`[DEBUG] Calling: ${url}`);
    console.log(`[DEBUG] File size: ${buf.length} bytes, type: ${mime}`);
    console.log(`[DEBUG] Timeout: ${config.timeout}ms, Retries: ${config.retries}`);
    
    // Robust fetch with timeout and retries
    const fetchWithRetry = async (attempt = 1): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      try {
        const response = await fetch(url, {
          method: "POST",
          body: formData,
          cache: "no-store",
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'RetinaAI-NextJS-Client/1.0'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
        
      } catch (error) {
        clearTimeout(timeoutId);
        
        console.error(`[ERROR] Attempt ${attempt}/${config.retries + 1} failed:`, error);
        
        if (attempt <= config.retries && 
            (error instanceof Error && 
             (error.name === 'AbortError' || error.message.includes('timeout')))) {
          
          console.log(`[RETRY] Retrying in 2 seconds... (${attempt}/${config.retries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchWithRetry(attempt + 1);
        }
        
        throw error;
      }
    };
    
    const res = await fetchWithRetry();
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error(`[ERROR] HuggingFace API error ${res.status}:`, errorText);
      return NextResponse.json(
        { ok: false, error: `HuggingFace API error ${res.status}: ${errorText}` },
        { status: res.status }
      );
    }
    
    let out;
    try {
      out = await res.json();
    } catch (parseError) {
      console.error('[ERROR] Failed to parse HuggingFace response as JSON:', parseError);
      const textResponse = await res.text().catch(() => 'No response text available');
      return NextResponse.json(
        { ok: false, error: `Invalid JSON response from HuggingFace: ${textResponse.substring(0, 200)}` },
        { status: 502 }
      );
    }
    
    console.log('[DEBUG] HuggingFace response:', JSON.stringify(out, null, 2));
    
    // Validate FastAPI response format for 5-class model
    if (!out || typeof out !== 'object') {
      return NextResponse.json(
        { ok: false, error: 'Invalid response format from HuggingFace' },
        { status: 502 }
      );
    }
    
    if (!out.success) {
      const errorMessage = out.error || out.message || 'FastAPI returned error';
      console.error('[ERROR] FastAPI error:', errorMessage);
      return NextResponse.json(
        { ok: false, error: `AI Model Error: ${errorMessage}` },
        { status: 422 }
      );
    }
    
    // Validate required fields
    const prediction = out.prediction;
    const allProbabilities = out.all_probabilities;
    const metadata = out.metadata;
    
    if (!prediction || !allProbabilities || !metadata) {
      console.error('[ERROR] Missing required fields in FastAPI response:', {
        hasPrediction: !!prediction,
        hasProbabilities: !!allProbabilities,
        hasMetadata: !!metadata
      });
      return NextResponse.json(
        { ok: false, error: 'Incomplete response from AI model' },
        { status: 502 }
      );
    }
    
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
    const config = getConfig();
    const message = e instanceof Error ? e.message : "Internal error";
    
    console.error('[ERROR] API route error:', {
      message,
      name: e instanceof Error ? e.name : 'Unknown',
      stack: config.isDevelopment ? (e instanceof Error ? e.stack : undefined) : 'Stack trace hidden in production',
      url: `${config.spaceUrl}/predict`,
      environment: config.isProduction ? 'production' : 'development'
    });
    
    // Handle specific error types with user-friendly messages
    if (e instanceof Error) {
      if (e.name === 'AbortError') {
        return NextResponse.json({ 
          ok: false, 
          error: 'AI analysis timed out. The server is busy, please try again in a moment.' 
        }, { status: 504 });
      }
      
      if (e.message.includes('fetch failed') || e.message.includes('ENOTFOUND') || e.message.includes('ECONNREFUSED')) {
        return NextResponse.json({ 
          ok: false, 
          error: 'Cannot connect to AI service. Please check your internet connection and try again.' 
        }, { status: 502 });
      }
      
      if (e.message.includes('getaddrinfo') || e.message.includes('network')) {
        return NextResponse.json({ 
          ok: false, 
          error: 'Network connectivity issue. Please try again later.' 
        }, { status: 502 });
      }
      
      if (e.message.includes('timeout')) {
        return NextResponse.json({ 
          ok: false, 
          error: 'AI processing took too long. Please try with a smaller image or try again later.' 
        }, { status: 504 });
      }
    }
    
    // Generic error for production vs development
    const genericError = config.isProduction 
      ? 'AI analysis service is temporarily unavailable. Please try again later.'
      : `Development Error: ${message}`;
    
    return NextResponse.json({ ok: false, error: genericError }, { status: 500 });
  }
}
