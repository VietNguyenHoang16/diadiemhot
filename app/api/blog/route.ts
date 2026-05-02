import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { extractProvinceFromContent, stripBlogContentMetadata } from '@/app/lib/blog-post-meta';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category')?.trim();
    const province = searchParams.get('province')?.trim();

    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        ...(category && category !== 'Tất Cả' && { category }),
        ...(province && province !== 'Tất Cả' && {
          province: { name: { equals: province } }
        }),
      },
      include: {
        province: true,
      },
      orderBy: { publishedAt: 'desc' },
    });

    const normalizedPosts = posts.map((post) => ({
      ...post,
      provinceName: post.province?.name || extractProvinceFromContent(post.content || ''),
      content: stripBlogContentMetadata(post.content || ''),
    }));

    return NextResponse.json(normalizedPosts);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
