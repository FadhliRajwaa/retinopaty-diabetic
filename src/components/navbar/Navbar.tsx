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

  const role = (user?.user_metadata as { role?: string } | null)?.role;
  const dashboardHref = role === "admin" ? "/dashboard/admin" : "/dashboard/patient";

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
                <SignOutButton />
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
