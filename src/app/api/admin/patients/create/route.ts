import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
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

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Supabase admin env is not configured" }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient();

    const body = await req.json();
    const { full_name, email, password, phone, date_of_birth, gender, address, status } = body as {
      full_name: string;
      email: string;
      password: string;
      phone?: string;
      date_of_birth?: string;
      gender?: string;
      address?: string;
      status?: "pending" | "approved" | "rejected" | "suspended";
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "patient", full_name }
    });

    // If user already exists, try to convert/update instead of failing outright
    if (createErr || !created?.user) {
      const msg = createErr?.message || "";
      if (msg.toLowerCase().includes("already been registered")) {
        // Find existing auth user by email
        const { data: listing, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (listErr) return NextResponse.json({ error: listErr.message }, { status: 400 });
        const existingUser = listing.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
        if (!existingUser) {
          return NextResponse.json({ error: "User dengan email ini sudah ada, namun tidak dapat diambil." }, { status: 400 });
        }

        // Prevent converting admin accounts
        const { data: existingProfile } = await supabaseAdmin
          .from("user_profiles")
          .select("role")
          .eq("user_id", existingUser.id)
          .maybeSingle();
        if (existingProfile?.role === "admin") {
          return NextResponse.json({ error: "Email ini milik admin dan tidak dapat dikonversi menjadi pasien" }, { status: 400 });
        }

        // Update password and metadata for existing user (if password provided)
        const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: password || undefined,
          user_metadata: { ...(existingUser.user_metadata || {}), role: "patient", full_name },
        });
        if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

        // Create or update user_profiles
        if (existingProfile) {
          const { error: updProfErr, data: profile } = await supabaseAdmin
            .from("user_profiles")
            .update({ full_name, email, phone, date_of_birth, gender, address, role: "patient", status: status || "approved" })
            .eq("user_id", existingUser.id)
            .select()
            .single();
          if (updProfErr) return NextResponse.json({ error: updProfErr.message }, { status: 400 });
          return NextResponse.json({ user_id: existingUser.id, profile }, { status: 200 });
        } else {
          const { error: insProfErr, data: profile } = await supabaseAdmin
            .from("user_profiles")
            .insert({ user_id: existingUser.id, email, full_name, phone, date_of_birth, gender, address, role: "patient", status: status || "approved" })
            .select()
            .single();
          if (insProfErr) return NextResponse.json({ error: insProfErr.message }, { status: 400 });
          return NextResponse.json({ user_id: existingUser.id, profile }, { status: 200 });
        }
      }

      return NextResponse.json({ error: createErr?.message || "Gagal membuat user" }, { status: 400 });
    }

    const newUser = created.user;

    const { error: profErr, data: profile } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        user_id: newUser.id,
        email,
        full_name,
        phone,
        date_of_birth,
        gender,
        address,
        role: "patient",
        status: status || "approved",
      })
      .select()
      .single();

    if (profErr) {
      // Cleanup auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.id);
      return NextResponse.json({ error: profErr.message }, { status: 400 });
    }

    return NextResponse.json({ user_id: newUser.id, profile }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
