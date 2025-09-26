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
      // Update user metadata if role is provided
      if (role) {
        try {
          await supabase.auth.updateUser({ data: { role } });
        } catch {
          // ignore if cannot update
        }
      }

      // Create or update user profile in database
      try {
        const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
        const userRole = role || data.user.user_metadata?.role || 'patient';
        
        await createOrUpdateProfile(
          data.user.id,
          data.user.email!,
          fullName,
          userRole
        );
      } catch (profileError) {
        console.error('Error creating/updating profile:', profileError);
      }

      // Revalidate paths to refresh server components with new auth state
      revalidatePath('/', 'layout');
      revalidatePath('/');
      
      // Use getURL() untuk konsisten dengan environment variables
      const baseURL = getURL();
      const response = NextResponse.redirect(`${baseURL}auth/login/success`);
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
