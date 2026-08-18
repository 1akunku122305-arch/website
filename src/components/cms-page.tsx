import type { PageDoc } from '@/lib/types';
import { MarkdownContent } from './markdown-content';

export function CmsPageView({ page }: { page: PageDoc | null }) {
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">{page?.title ?? 'Halaman'}</h1>
      <div className="mx-auto mt-6 max-w-3xl">
        <MarkdownContent markdown={page?.content ?? 'Konten belum tersedia.'} className="markdown-body" />
      </div>
    </div>
  );
}
