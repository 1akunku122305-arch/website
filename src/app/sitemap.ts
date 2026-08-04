import type { MetadataRoute } from "next";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await read();
  const now = new Date();

  const staticRoutes: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["/", 1, "daily"],
    ["/builder", 0.95, "weekly"],
    ["/about", 0.7, "monthly"],
    ["/infrastructure", 0.8, "monthly"],
    ["/features", 0.8, "monthly"],
    ["/why-wangstore", 0.7, "monthly"],
    ["/faq", 0.7, "weekly"],
    ["/testimonials", 0.6, "monthly"],
    ["/blog", 0.8, "daily"],
    ["/knowledge-base", 0.7, "weekly"],
    ["/status", 0.6, "hourly"],
    ["/contact", 0.7, "monthly"],
    ["/legal", 0.4, "yearly"],
  ];

  return [
    ...staticRoutes.map(([path, priority, changeFrequency]) => ({
      url: siteUrl(path),
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...db.posts
      .filter((p) => p.published)
      .map((p) => ({
        url: siteUrl(`/blog/${p.slug}`),
        lastModified: new Date(p.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ...db.articles.map((a) => ({
      url: siteUrl(`/knowledge-base/${a.slug}`),
      lastModified: new Date(a.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...Object.keys(db.settings.legal).map((slug) => ({
      url: siteUrl(`/legal/${slug}`),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
