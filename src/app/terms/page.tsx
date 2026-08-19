export const dynamic = 'force-dynamic';
export const metadata = { title: 'Syarat & Ketentuan' };
import { getLegalDoc } from '@/lib/cms/legal';
import { LegalView } from '@/components/legal-view';

export default async function TermsPage() {
  const doc = await getLegalDoc('terms');
  return <LegalView doc={doc} />;
}
