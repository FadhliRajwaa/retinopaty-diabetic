import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: adminProfile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Service role key is not configured" }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient();

    const body = await req.json();
    const { user_id, full_name, email, phone, date_of_birth, gender, address, status, password } = body as {
      user_id: string;
      full_name?: string;
      email?: string;
      phone?: string;
      date_of_birth?: string;
      gender?: string;
      address?: string;
      status?: "pending" | "approved" | "rejected" | "suspended";
      password?: string;
    };

    if (!user_id) {
      return NextResponse.json({ error: "user_id wajib ada" }, { status: 400 });
    }

    // Update auth email/password if provided
    if (email || password) {
      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        email: email || undefined,
        password: password || undefined,
        user_metadata: full_name ? { full_name } : undefined,
      });
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    // Update profile fields
    const { error: profErr, data: profile } = await supabaseAdmin
      .from("user_profiles")
      .update({ full_name, email, phone, date_of_birth, gender, address, status })
      .eq("user_id", user_id)
      .select()
      .single();

    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

    return NextResponse.json({ ok: true, profile });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
