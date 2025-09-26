import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { AnimatedLogo } from "@/components/navbar/AnimatedLogo";
import { MobileNavbar } from "@/components/navbar/MobileNavbar";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Debug logging
  console.log('Navbar - User:', user ? {
    id: user.id,
    email: user.email,
    metadata: user.user_metadata
  } : 'No user');

  const role = (user?.user_metadata as { role?: string } | null)?.role;
  const dashboardHref = role === "admin" ? "/dashboard/admin" : "/dashboard/patient";
  
  // Get user display name from metadata or email
  const userName = user?.user_metadata?.full_name || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'Pengguna';

  return (
    <header className="sticky top-0 z-50 w-full bg-background shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <AnimatedLogo />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={dashboardHref}
                  className="h-10 inline-flex items-center rounded-md px-4 text-sm font-medium bg-[#00ADB5] text-white hover:brightness-110 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 h-10 px-4 rounded-md text-sm font-medium border border-[#393E46]/30 hover:bg-[#393E46]/10 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-[#00ADB5] flex items-center justify-center text-white text-xs font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-24 truncate">{userName}</span>
                  </button>
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-[#222831] border border-[#393E46]/30 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-[#393E46]/20">
                        {user.email}
                      </div>
                      <div className="mt-1">
                        <SignOutButton variant="dropdown" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="h-10 inline-flex items-center rounded-md px-4 text-sm font-medium bg-[#00ADB5] text-white hover:brightness-110 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="h-10 inline-flex items-center rounded-md px-4 text-sm font-medium bg-gray-900 dark:bg-white border border-gray-900 dark:border-white hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors text-white dark:text-gray-900"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Navigation */}
          <MobileNavbar user={user} role={role} dashboardHref={dashboardHref} />
        </nav>
      </div>
    </header>
  );
}
