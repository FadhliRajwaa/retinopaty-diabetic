import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patient_id = searchParams.get('patient_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('scan_results')
      .select(`
        *,
        user_profiles!scan_results_patient_id_fkey (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by patient if specified
    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        ok: false, 
        error: `Database error: ${error.message}` 
      }, { status: 500 });
    }

    // Format response with patient info
    const formatted_data = data.map(scan => ({
      ...scan,
      patient_info: scan.user_profiles ? {
        full_name: scan.user_profiles.full_name,
        email: scan.user_profiles.email
      } : null
    }));

    return NextResponse.json({ 
      ok: true, 
      data: formatted_data,
      count: data.length
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error('Get scan history error:', error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
