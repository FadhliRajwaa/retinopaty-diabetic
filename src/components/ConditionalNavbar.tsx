"use client";

import { usePathname } from "next/navigation";
import NavbarClient from "@/components/navbar/NavbarClient";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar for all dashboard routes (admin & patient)
  const hideNavbar = pathname?.startsWith('/dashboard');
  
  if (hideNavbar) {
    return null;
  }
  
  return <NavbarClient />;
}
