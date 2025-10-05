import type { Metadata } from "next";
import PatientSidebar from "@/components/dashboard/patient/PatientSidebar";

export const metadata: Metadata = {
  title: "Dashboard Pasien - RetinaAI",
  description: "Panel pasien RetinaAI dengan ringkasan kesehatan, riwayat scan, dan jadwal.",
};

export default function PatientDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] lg:flex">
      {/* Sidebar */}
      <PatientSidebar />

      {/* Content */}
      <div className="flex-1 min-w-0 lg:min-h-[100dvh]">
        {/* Push content below mobile topbar height */}
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
