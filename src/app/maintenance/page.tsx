import type { Metadata } from 'next';
import { Server } from 'lucide-react';
import { getSiteSettings } from '@/lib/settings';

export const metadata: Metadata = { title: 'Sedang Dalam Pemeliharaan', robots: { index: false } };

export default async function MaintenancePage() {
  const settings = await getSiteSettings();
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
        <Server className="h-6 w-6" />
      </span>
      <h1 className="text-2xl font-bold">{settings.maintenanceTitle}</h1>
      <p className="max-w-md text-neutral-500 dark:text-neutral-400">{settings.maintenanceMessage}</p>
      {settings.maintenanceEta && (
        <p className="text-sm text-neutral-400">Perkiraan selesai: {settings.maintenanceEta}</p>
      )}
    </div>
  );
}
