import { marked } from 'marked';

/**
 * Markdown → safe HTML. Renders for Blog, Knowledge Base, CMS pages, legal docs.
 * Output is sanitized to block script execution and dangerous attributes.
 */

marked.setOptions({ gfm: true, breaks: true });

const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
  'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'blockquote',
  'code', 'pre', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div',
]);

/** Minimal, strict HTML sanitizer for admin-authored markdown output. */
export function sanitizeHtml(input: string): string {
  // Remove anything that could execute scripts.
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?<\/embed>/gi, '')
    .replace(/ on\w+="[^"]*"/gi, '')
    .replace(/ on\w+='[^']*'/gi, '')
    .replace(/ on\w+=[^\s>]+/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/style\s*=\s*"[^"]*"/gi, '');
}

export function renderMarkdown(markdown: string): string {
  const raw = marked.parse(markdown || '') as string;
  return sanitizeHtml(raw);
}
