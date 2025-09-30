"use client";

import { usePathname } from "next/navigation";
import NavbarClient from "@/components/navbar/NavbarClient";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar for admin dashboard routes
  const hideNavbar = pathname?.startsWith('/dashboard/admin');
  
  if (hideNavbar) {
    return null;
  }
  
  return <NavbarClient />;
}
