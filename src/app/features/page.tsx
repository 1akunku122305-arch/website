export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { getPageByKey } from '@/lib/cms/pages';
import { CmsPageView } from '@/components/cms-page';

export const metadata: Metadata = { title: 'Fitur' };

export default async function FeaturesPage() {
  const page = await getPageByKey('features');
  return <CmsPageView page={page} />;
}
