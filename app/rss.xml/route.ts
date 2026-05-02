import { prisma } from '@/app/lib/db';
import { stripBlogContentMetadata } from '@/app/lib/blog-post-meta';
import { getAbsoluteUrl, getSiteUrl, SITE_DESCRIPTION, SITE_NAME, stripHtml } from '@/app/lib/site-config';

export const dynamic = 'force-dynamic';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      updatedAt: true,
    },
    orderBy: [
      { publishedAt: 'desc' },
      { updatedAt: 'desc' },
    ],
    take: 50,
  });

  const items = posts.map((post) => {
    const url = getAbsoluteUrl(`/blog/${post.slug}`);
    const description = escapeXml(
      post.excerpt?.trim() || stripHtml(stripBlogContentMetadata(post.content)).slice(0, 240)
    );

    return `
      <item>
        <title>${escapeXml(post.title)}</title>
        <link>${url}</link>
        <guid>${url}</guid>
        <description>${description}</description>
        <pubDate>${new Date(post.publishedAt || post.updatedAt).toUTCString()}</pubDate>
      </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(SITE_NAME)}</title>
        <link>${getSiteUrl()}</link>
        <description>${escapeXml(SITE_DESCRIPTION)}</description>
        <language>vi-VN</language>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
