import { getDatastore } from '@/lib/db';
import { CmsManager, type ResourceConfig } from '../cms-manager';
import type { BlogCategory } from '@/lib/types';

export default async function AdminBlogPage() {
  const store = await getDatastore();
  const categories = await store.list<BlogCategory>('blogCategories').catch(() => []);

  const config: ResourceConfig = {
    resourceKey: 'blog',
    title: 'Blog',
    description: 'Kelola artikel blog (Markdown, kategori, tag, SEO).',
    statusField: 'status',
    statusActive: 'published',
    labelField: 'title',
    fields: [
      { name: 'title', label: 'Judul', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'excerpt', label: 'Ringkasan', type: 'textarea' },
      { name: 'content', label: 'Konten (Markdown)', type: 'textarea', required: true },
      { name: 'categoryId', label: 'Kategori', type: 'select', options: categories.map((c) => ({ value: c.id, label: c.name })) },
      { name: 'tags', label: 'Tag', type: 'tags' },
      { name: 'author', label: 'Penulis', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] },
      { name: 'featured', label: 'Featured', type: 'checkbox' },
    ],
    
  };

  return <CmsManager config={config} />;
}
