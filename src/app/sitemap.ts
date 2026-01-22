import { MetadataRoute } from "next";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "@/keystatic.config";
import env from "@/env";
import { STATIC_PAGES } from "@/lib/config/sitemap";

const reader = createReader(process.cwd(), keystaticConfig);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  // 生成静态页面 sitemap 条目
  const staticPages = STATIC_PAGES.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    ...(page.images && { images: page.images.map((img) => `${baseUrl}${img}`) }),
  }));

  // 获取博客文章
  const blogPosts = await reader.collections.posts.all();
  const blogPostEntries = blogPosts.map((post) => {
    const images: string[] = [];

    if (post.entry.heroImage) {
      images.push(`${baseUrl}/blog/${post.entry.heroImage}`);
    }

    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.entry.publishedDate
        ? new Date(post.entry.publishedDate)
        : new Date(),
      changeFrequency: "yearly" as const,
      priority: post.entry.featured ? 0.8 : 0.7,
      ...(images.length > 0 && { images }),
    };
  });

  return [...staticPages, ...blogPostEntries];
}
