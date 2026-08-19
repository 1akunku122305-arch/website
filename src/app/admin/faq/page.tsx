export const dynamic = 'force-dynamic';
import { CmsManager, type ResourceConfig } from '../cms-manager';

const config: ResourceConfig = {
  resourceKey: 'faq',
  title: 'FAQ',
  description: 'Kelola pertanyaan umum.',
  labelField: 'question',
  fields: [
    { name: 'question', label: 'Pertanyaan', type: 'text', required: true },
    { name: 'answer', label: 'Jawaban', type: 'textarea', required: true },
    { name: 'category', label: 'Kategori', type: 'text' },
    { name: 'order', label: 'Urutan', type: 'number' },
    { name: 'published', label: 'Tampilkan', type: 'checkbox' },
  ],
  
};

export default function AdminFaqPage() {
  return <CmsManager config={config} />;
}
