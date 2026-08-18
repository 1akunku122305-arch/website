import { ok } from '@/lib/api';
import { getSiteSettings } from '@/lib/settings';

export const runtime = 'nodejs';

/** Public health endpoint exposing only the maintenance flag/message (no secrets). */
export async function GET() {
  const settings = await getSiteSettings();
  return ok({
    maintenanceMode: settings.maintenanceMode,
    title: settings.maintenanceTitle,
    message: settings.maintenanceMessage,
    eta: settings.maintenanceEta,
  });
}
