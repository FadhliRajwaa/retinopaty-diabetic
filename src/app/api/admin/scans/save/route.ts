import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user and their profile
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to get the correct ID for foreign key
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, role, status')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== 'admin') {
      console.error('Profile check failed:', { profileError, userProfile });
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      patient_id,
      patient_name,
      image_url,
      prediction,
      confidence,
      analysis_date,
      notes,
      manual_suggestion
    } = body;

    if (!patient_id || !prediction) {
      return NextResponse.json({ 
        ok: false, 
        error: "Field patient_id dan prediction wajib diisi" 
      }, { status: 400 });
    }

    console.log('[DEBUG] Save scan - User info:', {
      auth_user_id: user.id,
      profile_id: userProfile.id,
      patient_id,
      role: userProfile.role
    });

    // Generate automatic doctor suggestion based on prediction and confidence
    let auto_suggestion = "";
    if (prediction === "DR") {
      if (confidence >= 90) {
        auto_suggestion = "Rujuk segera ke dokter mata spesialis retina. Kemungkinan besar terdapat diabetic retinopathy yang memerlukan penanganan segera.";
      } else if (confidence >= 70) {
        auto_suggestion = "Disarankan untuk konsultasi ke dokter mata. Hasil menunjukkan kemungkinan diabetic retinopathy.";
      } else {
        auto_suggestion = "Perlu pemeriksaan lebih lanjut. Hasil tidak conclusive, sebaiknya konsultasi dengan dokter mata.";
      }
    } else { // NO_DR
      if (confidence >= 90) {
        auto_suggestion = "Kondisi retina terlihat normal. Tetap jaga kontrol gula darah dan pemeriksaan rutin setiap 6-12 bulan.";
      } else if (confidence >= 70) {
        auto_suggestion = "Kemungkinan besar kondisi retina normal, namun tetap disarankan kontrol rutin setiap 6 bulan.";
      } else {
        auto_suggestion = "Hasil tidak conclusive. Disarankan pemeriksaan ulang atau konsultasi dengan dokter mata.";
      }
    }

    // Manual suggestion will be used if provided, auto_suggestion is generated for database

    // Insert scan result to database
    const { data, error } = await supabase
      .from('scan_results')
      .insert({
        patient_id,
        patient_name,
        image_url,
        prediction,
        confidence: Math.round(confidence * 100) / 100, // round to 2 decimal places
        analysis_date: analysis_date || new Date().toISOString(),
        notes: notes || null,
        doctor_suggestion: auto_suggestion, // Auto-generated suggestion
        manual_suggestion: manual_suggestion || null, // Manual override if provided
        created_by: userProfile.id,  // Use user_profiles.id instead of auth.uid
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        ok: false, 
        error: `Database error: ${error.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      data,
      auto_suggestion // return auto suggestion for reference
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error('Save scan error:', error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
