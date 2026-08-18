import type { LegalDocument } from '@/lib/types';
import { MarkdownContent } from './markdown-content';

export function LegalView({ doc }: { doc: LegalDocument | null }) {
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">{doc?.title ?? 'Dokumen'}</h1>
      <div className="mx-auto mt-6 max-w-3xl">
        <MarkdownContent markdown={doc?.content ?? 'Konten belum tersedia.'} className="markdown-body" />
      </div>
    </div>
  );
}
