import type { Metadata } from 'next';
import { getPageByKey } from '@/lib/cms/pages';
import { CmsPageView } from '@/components/cms-page';

export const metadata: Metadata = { title: 'Mengapa WangStore' };

export default async function WhyWangstorePage() {
  const page = await getPageByKey('why-wangstore');
  return <CmsPageView page={page} />;
}
