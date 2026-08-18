import { getDatastore } from '@/lib/db';
import type { CollectionItem } from '@/lib/db/types';

export interface SiteSettings {
  siteName: string;
  tagline: string;
  whatsapp: string;
  discord: string;
  email: string;
  twitter: string;
  instagram: string;
  github: string;
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceEta?: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'WangStore',
  tagline: 'Build Your Own Server.',
  whatsapp: '',
  discord: '',
  email: '',
  twitter: '',
  instagram: '',
  github: '',
  maintenanceMode: false,
  maintenanceTitle: 'Sedang Dalam Pemeliharaan',
  maintenanceMessage: 'WangStore sedang menjalani pemeliharaan. Silakan kembali beberapa saat lagi.',
};

function toString(v: unknown, fallback = ''): string {
  return typeof v === 'string' && v.length ? v : fallback;
}
function toBool(v: unknown): boolean {
  return v === true || v === 'true' || v === 1;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const store = await getDatastore();
  let row: CollectionItem | null = null;
  try {
    row = await store.get('siteSettings', 'site');
  } catch {
    row = null;
  }
  const s = (row ?? {}) as Record<string, unknown>;
  const whatsapp = toString(s.whatsapp) || process.env.WHATSAPP_NUMBER || '';
  return {
    siteName: toString(s.siteName) || DEFAULT_SETTINGS.siteName,
    tagline: toString(s.tagline) || DEFAULT_SETTINGS.tagline,
    whatsapp,
    discord: toString(s.discord),
    email: toString(s.email),
    twitter: toString(s.twitter),
    instagram: toString(s.instagram),
    github: toString(s.github),
    maintenanceMode: toBool(s.maintenanceMode),
    maintenanceTitle: toString(s.maintenanceTitle) || DEFAULT_SETTINGS.maintenanceTitle,
    maintenanceMessage: toString(s.maintenanceMessage) || DEFAULT_SETTINGS.maintenanceMessage,
    maintenanceEta: toString(s.maintenanceEta),
  };
}

export const settingsKey = 'site';
