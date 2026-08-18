import { CmsManager, type ResourceConfig } from '../cms-manager';

const config: ResourceConfig = {
  resourceKey: 'testimonials',
  title: 'Testimoni',
  description: 'Kelola testimoni. Hanya tampilkan yang asli dan terverifikasi.',
  labelField: 'name',
  fields: [
    { name: 'name', label: 'Nama', type: 'text', required: true },
    { name: 'role', label: 'Peran', type: 'text' },
    { name: 'content', label: 'Isi Testimoni', type: 'textarea', required: true },
    { name: 'rating', label: 'Rating (1-5)', type: 'number' },
    { name: 'published', label: 'Tampilkan', type: 'checkbox' },
  ],
  
};

export default function AdminTestimonialsPage() {
  return <CmsManager config={config} />;
}
