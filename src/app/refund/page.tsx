export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kebijakan Pengembalian Dana' };
import { getLegalDoc } from '@/lib/cms/legal';
import { LegalView } from '@/components/legal-view';

export default async function RefundPage() {
  const doc = await getLegalDoc('refund');
  return <LegalView doc={doc} />;
}
