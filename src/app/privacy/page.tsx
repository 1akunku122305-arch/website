export const metadata = { title: 'Kebijakan Privasi' };
import { getLegalDoc } from '@/lib/cms/legal';
import { LegalView } from '@/components/legal-view';

export default async function PrivacyPage() {
  const doc = await getLegalDoc('privacy');
  return <LegalView doc={doc} />;
}
