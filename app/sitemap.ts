import type { MetadataRoute } from 'next';
import { prisma } from '@/app/lib/db';
import { getAbsoluteUrl } from '@/app/lib/site-config';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      slug: true,
      image: true,
      publishedAt: true,
      updatedAt: true,
    },
    orderBy: [
      { publishedAt: 'desc' },
      { updatedAt: 'desc' },
    ],
  });
  const latestPostDate = posts[0]?.updatedAt || posts[0]?.publishedAt || new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl('/'),
      lastModified: latestPostDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: getAbsoluteUrl('/blog'),
      lastModified: latestPostDate,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: getAbsoluteUrl('/ve-chung-toi'),
      lastModified: latestPostDate,
      changeFrequency: 'monthly',
      priority: 0.45,
    },
    {
      url: getAbsoluteUrl('/chinh-sach-bao-mat'),
      lastModified: latestPostDate,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: getAbsoluteUrl('/dieu-khoan-su-dung'),
      lastModified: latestPostDate,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  const articlePages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: getAbsoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updatedAt || post.publishedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
    ...(post.image ? { images: [post.image] } : {}),
  }));

  return [...staticPages, ...articlePages];
}
