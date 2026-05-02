import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { extractProvinceFromContent, stripBlogContentMetadata } from '@/app/lib/blog-post-meta';
import { safePublicDbQuery } from '@/app/lib/public-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category')?.trim();
  const province = searchParams.get('province')?.trim();

  const posts = await safePublicDbQuery('api-blog', [], () =>
    prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        ...(category && category !== 'Táº¥t Cáº£' && { category }),
        ...(province && province !== 'Táº¥t Cáº£' && {
          province: { name: { equals: province } },
        }),
      },
      include: {
        province: true,
      },
      orderBy: { publishedAt: 'desc' },
    })
  );

  const normalizedPosts = posts.map((post) => ({
    ...post,
    provinceName: post.province?.name || extractProvinceFromContent(post.content || ''),
    content: stripBlogContentMetadata(post.content || ''),
  }));

  return NextResponse.json(normalizedPosts);
}
