export const metadata = { title: 'Kebijakan Penggunaan yang Dapat Diterima' };
import { getLegalDoc } from '@/lib/cms/legal';
import { LegalView } from '@/components/legal-view';

export default async function AcceptableUsePage() {
  const doc = await getLegalDoc('acceptable-use');
  return <LegalView doc={doc} />;
}
