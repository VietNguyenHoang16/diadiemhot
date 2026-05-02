import { cache } from 'react';
import { prisma } from '@/app/lib/db';
import { extractBlogContentMetadata, stripBlogContentMetadata } from '@/app/lib/blog-post-meta';
import { buildDescription, uniqKeywords } from '@/app/lib/site-config';

function normalizeBlogPost<T extends {
  content?: string | null;
  excerpt?: string | null;
  category?: string | null;
  image?: string | null;
  province?: { name?: string | null } | null;
  tags?: Array<{ tag: { name: string; slug: string } }>;
}>(post: T) {
  const metadata = extractBlogContentMetadata(post.content);
  const cleanContent = stripBlogContentMetadata(post.content);
  const provinceName = post.province?.name || metadata.province || '';
  const tagNames = (post.tags || []).map((item) => item.tag.name);
  const keywords = uniqKeywords([
    ...(metadata.keywords || []),
    ...tagNames,
    post.category || '',
    provinceName,
  ]);

  return {
    ...post,
    cleanContent,
    provinceName,
    metaTitle: metadata.metaTitle || '',
    metaDescription: metadata.metaDescription || buildDescription(post.excerpt, cleanContent, post.category || ''),
    targetKeywords: keywords,
    tagNames,
  };
}

export const getPublishedBlogPostBySlug = cache(async (slug: string) => {
  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    include: {
      province: { select: { name: true } },
      tags: { include: { tag: true } },
    },
  });

  return post ? normalizeBlogPost(post) : null;
});

export const getPublicBlogPostBySlug = cache(async (slug: string) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      province: { select: { name: true } },
      tags: { include: { tag: true } },
    },
  });

  return post ? normalizeBlogPost(post) : null;
});

export const getPublishedBlogIndexPosts = cache(async () => {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      province: { select: { name: true } },
      tags: { include: { tag: true } },
    },
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return posts.map(normalizeBlogPost);
});

export function filterPublishedPosts<T extends { category?: string | null; provinceName?: string | null }>(
  posts: T[],
  category?: string,
  province?: string
) {
  return posts.filter((post) => {
    const categoryMatch = !category || category === 'Tất Cả' || post.category === category;
    const provinceMatch = !province || province === 'Tất Cả' || post.provinceName === province;
    return categoryMatch && provinceMatch;
  });
}
