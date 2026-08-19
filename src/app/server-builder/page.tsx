export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { ServerBuilder } from './server-builder';

export const metadata: Metadata = {
  title: 'Server Builder',
  description: 'Konfigurasi server Anda dengan harga real-time. Pilih tier, atur CPU/RAM/penyimpanan, dan pesan.',
};

export default async function ServerBuilderPage() {
  const session = await getSession().catch(() => null);
  const user = session
    ? { email: session.email, name: session.name, userId: session.sub }
    : null;

  return <ServerBuilder user={user} />;
}
