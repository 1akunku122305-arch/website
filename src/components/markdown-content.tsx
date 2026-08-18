import { renderMarkdown } from '@/lib/markdown';

/**
 * Server component that renders admin-authored markdown as safe HTML.
 */
export function MarkdownContent({ markdown, className }: { markdown: string; className?: string }) {
  const html = renderMarkdown(markdown);
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      data-testid="markdown-content"
    />
  );
}
