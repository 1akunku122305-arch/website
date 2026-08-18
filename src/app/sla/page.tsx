export const metadata = { title: 'Service Level Agreement' };
import { getLegalDoc } from '@/lib/cms/legal';
import { LegalView } from '@/components/legal-view';

export default async function SlaPage() {
  const doc = await getLegalDoc('sla');
  return <LegalView doc={doc} />;
}
