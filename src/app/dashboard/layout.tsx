export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getDatastore } from '@/lib/db';
import type { User } from '@/lib/types';
import { DashboardSidebar } from './dashboard-sidebar';

export const metadata = { robots: { index: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect('/login');
  const store = await getDatastore();
  const user = await store.get<User>('users', session.sub);
  if (!user) redirect('/login');

  // Email verification gate: unverified customers cannot access main features.
  if (user.role === 'customer' && !user.emailVerified) {
    redirect('/verify-email?status=unverified');
  }

  return (
    <div className="container-page flex flex-col gap-6 py-8 lg:flex-row">
      <DashboardSidebar user={{ name: user.name, email: user.email }} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
