export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { getPageByKey } from '@/lib/cms/pages';
import { CmsPageView } from '@/components/cms-page';

export const metadata: Metadata = { title: 'Infrastruktur' };

export default async function InfrastructurePage() {
  const page = await getPageByKey('infrastructure');
  return <CmsPageView page={page} />;
}
