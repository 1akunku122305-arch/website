export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { VerifyEmailView } from './verify-email-view';

export const metadata: Metadata = { title: 'Verifikasi Email', robots: { index: false } };

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { status?: string; token?: string; cooldown?: string };
}) {
  return (
    <div className="container-page flex justify-center py-16">
      <VerifyEmailView
        initialStatus={searchParams.status}
        token={searchParams.token}
        initialCooldown={searchParams.cooldown}
      />
    </div>
  );
}
