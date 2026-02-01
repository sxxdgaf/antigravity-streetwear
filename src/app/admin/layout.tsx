import { redirect } from 'next/navigation';
import { isAdmin } from '@/app/actions/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

/**
 * Admin Layout
 * Protected layout for admin dashboard
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check admin access
  const hasAccess = await isAdmin();

  if (!hasAccess) {
    redirect('/login?redirect=/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-brand-grey-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <AdminHeader />

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
