import type { Metadata } from 'next';
import { getPageByKey } from '@/lib/cms/pages';
import { CmsPageView } from '@/components/cms-page';

export const metadata: Metadata = { title: 'Tentang WangStore' };

export default async function AboutPage() {
  const page = await getPageByKey('about');
  return <CmsPageView page={page} />;
}
