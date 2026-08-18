import { CmsManager, type ResourceConfig } from '../cms-manager';

const pagesConfig: ResourceConfig = {
  resourceKey: 'pages',
  title: 'Halaman Konten',
  description: 'Kelola halaman publik (home, about, features, dll). Konten diedit tanpa menyentuh kode.',
  labelField: 'title',
  fields: [
    { name: 'title', label: 'Judul', type: 'text', required: true },
    { name: 'content', label: 'Konten (Markdown)', type: 'textarea', required: true },
    { name: 'seoTitle', label: 'SEO Title', type: 'text' },
    { name: 'seoDescription', label: 'SEO Description', type: 'textarea' },
  ],
  
};

const legalConfig: ResourceConfig = {
  resourceKey: 'legal',
  title: 'Dokumen Legal',
  description: 'Kelola dokumen legal (terms, privacy, refund, SLA, dll).',
  labelField: 'title',
  fields: [
    { name: 'title', label: 'Judul', type: 'text', required: true },
    { name: 'content', label: 'Konten (Markdown)', type: 'textarea', required: true },
    { name: 'seoTitle', label: 'SEO Title', type: 'text' },
    { name: 'seoDescription', label: 'SEO Description', type: 'textarea' },
  ],
  
};

export default function AdminCmsPage() {
  return (
    <div className="space-y-10">
      <CmsManager config={pagesConfig} />
      <div className="border-t border-neutral-200 pt-10 dark:border-neutral-800">
        <CmsManager config={legalConfig} />
      </div>
    </div>
  );
}
