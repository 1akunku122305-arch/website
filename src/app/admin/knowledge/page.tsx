export const dynamic = 'force-dynamic';
import { CmsManager, type ResourceConfig } from '../cms-manager';

const KB_CATEGORIES = ['Memulai', 'Pemesanan', 'Pembayaran', 'Minecraft', 'Server', 'Troubleshooting', 'Akun', 'Kebijakan'];

const config: ResourceConfig = {
  resourceKey: 'knowledgeBase',
  title: 'Knowledge Base',
  description: 'Kelola artikel knowledge base.',
  statusField: 'status',
  statusActive: 'published',
    labelField: 'title',
  fields: [
    { name: 'title', label: 'Judul', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true },
    { name: 'excerpt', label: 'Ringkasan', type: 'textarea' },
    { name: 'content', label: 'Konten (Markdown)', type: 'textarea', required: true },
    { name: 'category', label: 'Kategori', type: 'select', options: KB_CATEGORIES },
    { name: 'tags', label: 'Tag', type: 'tags' },
    { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] },
  ],
  
};

export default function AdminKnowledgePage() {
  return <CmsManager config={config} />;
}
