import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - RetinaAI',
  description: 'Admin panel untuk RetinaAI - Kelola pasien dan hasil scan retina',
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout khusus admin tanpa navbar - langsung render children
  return (
    <div className="admin-dashboard">
      {children}
    </div>
  );
}
