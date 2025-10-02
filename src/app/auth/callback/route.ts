import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrUpdateProfile } from "@/lib/supabase/profile";
import { getURL } from "@/lib/auth-config";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/";
  const role = searchParams.get("role");

  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    console.log('OAuth callback - Exchange result:', { error, user: data.user?.email });

    if (!error && data.user) {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('role,status')
        .eq('user_id', data.user.id)
        .maybeSingle();

      // If no profile and no explicit role from register, force user to register page
      if (!existingProfile && !role) {
        const baseURL = getURL();
        await supabase.auth.signOut();
        return NextResponse.redirect(`${baseURL}auth/register?need_register=1`);
      }

      // If role provided (from register), create/update profile accordingly
      if (!existingProfile && role) {
        try {
          await supabase.auth.updateUser({ data: { role } }).catch(() => {});
          const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
          await createOrUpdateProfile(
            data.user.id,
            data.user.email!,
            fullName,
            role
          );
        } catch (profileError) {
          console.error('Error creating profile after OAuth:', profileError);
        }
      }

      // Fetch profile to check approval status (created or existing)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role,status')
        .eq('user_id', data.user.id)
        .single();

      // Revalidate paths to refresh server components with new auth state
      revalidatePath('/', 'layout');
      revalidatePath('/');
      
      // Use getURL() untuk konsisten dengan environment variables
      const baseURL = getURL();
      const destination = !profile || profile.status !== 'approved'
        ? 'auth/pending'
        : (profile.role === 'admin' ? 'dashboard/admin' : 'dashboard/patient');

      // If not approved, sign out to prevent using session
      if (!profile || profile.status !== 'approved') {
        await supabase.auth.signOut();
      }

      const response = NextResponse.redirect(`${baseURL}${destination}`);
      // Clear cache to ensure navbar re-renders with new user state
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }
  }

  const baseURL = getURL();
  return NextResponse.redirect(`${baseURL}auth/login?error=oauth_callback`);
}
