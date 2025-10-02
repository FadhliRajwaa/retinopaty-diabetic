import { createClient } from "./server";

export async function createOrUpdateProfile(userId: string, email: string, fullName?: string, role?: string) {
  const supabase = await createClient();
  
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existingProfile) {
    // Update existing profile
    const { error } = await supabase
      .from('user_profiles')
      .update({
        email,
        full_name: fullName || existingProfile.full_name,
        role: role || existingProfile.role,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return { error };
    }
  } else {
    // Create new profile
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        email,
        full_name: fullName,
        role: role || 'patient',
        // Default status: patients must be approved by admin first
        status: (role || 'patient') === 'admin' ? 'approved' : 'pending'
      });

    if (error) {
      console.error('Error creating user profile:', error);
      return { error };
    }
  }

  return { success: true };
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return { error };
  }

  return { data };
}
