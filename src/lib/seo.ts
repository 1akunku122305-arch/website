export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'WangStore';
export const SITE_TAGLINE = 'Build Your Own Server.';
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

export function absoluteUrl(path = ''): string {
  return `${APP_URL}${path.startsWith('/') ? path : '/' + path}`;
}

export interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  type?: 'website' | 'article' | 'webpage';
  publishedTime?: string;
  image?: string;
}

export function buildMetadata(seo: SeoProps = {}) {
  const title = seo.title ? `${seo.title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const description = seo.description || 'WangStore adalah platform penjualan dan pengelolaan layanan hosting.';
  const url = absoluteUrl(seo.path ?? '/');
  return {
    metadataBase: new URL(APP_URL),
    title,
    description,
    alternates: { canonical: url },
    robots: seo.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: seo.type ?? 'website',
      ...(seo.publishedTime ? { article: { publishedTime: seo.publishedTime } } : {}),
      ...(seo.image ? { images: [{ url: seo.image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
