import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(req: Request) {
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

    const { user_id } = await req.json() as { user_id: string };
    if (!user_id) return NextResponse.json({ error: "user_id wajib ada" }, { status: 400 });

    // Delete profile first (to avoid dangling FKs in your app schema)
    const { error: profErr } = await supabaseAdmin
      .from("user_profiles")
      .delete()
      .eq("user_id", user_id);
    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

    // Delete auth user
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
