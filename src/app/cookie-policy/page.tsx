export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kebijakan Cookie' };
import { getLegalDoc } from '@/lib/cms/legal';
import { LegalView } from '@/components/legal-view';

export default async function CookiePolicyPage() {
  const doc = await getLegalDoc('cookie-policy');
  return <LegalView doc={doc} />;
}
