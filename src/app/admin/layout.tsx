import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getDatastore } from '@/lib/db';
import { isStaffRole } from '@/lib/auth/rbac';
import type { User } from '@/lib/types';
import { AdminSidebar } from './admin-sidebar';

export const metadata = { robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect('/login');
  if (!isStaffRole(session.role)) redirect('/dashboard');

  const store = await getDatastore();
  const user = await store.get<User>('users', session.sub);
  if (!user) redirect('/login');

  return (
    <div className="container-page flex flex-col gap-6 py-8 lg:flex-row">
      <AdminSidebar role={session.role} userName={user.name} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
