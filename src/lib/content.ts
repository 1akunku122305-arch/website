import "server-only";
import { marked } from "marked";
import { read } from "./db";

marked.setOptions({ gfm: true, breaks: false });

/** Renders trusted CMS markdown to HTML. Input is sanitised on write (see validation.ts). */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

export async function getSettings() {
  return (await read()).settings;
}

export async function getPublishedPosts() {
  const db = await read();
  return db.posts
    .filter((p) => p.published)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getPost(slug: string) {
  const db = await read();
  return db.posts.find((p) => p.slug === slug && p.published) ?? null;
}

export async function getArticles() {
  return (await read()).articles;
}

export async function getArticle(slug: string) {
  const db = await read();
  return db.articles.find((a) => a.slug === slug) ?? null;
}

export function siteUrl(path = "/"): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://wangstore.id";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
