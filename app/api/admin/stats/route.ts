import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [businesses, reviews, posts, leads, users, newsletters, categories, locations] = await Promise.all([
      prisma.business.count(),
      prisma.review.count(),
      prisma.blogPost.count(),
      prisma.lead.count({ where: { status: 'PENDING' } }),
      prisma.user.count(),
      prisma.newsletter.count({ where: { status: true } }),
      prisma.category.count(),
      prisma.location.count(),
    ]);

    return NextResponse.json({
      businesses,
      reviews,
      posts,
      leads,
      users,
      newsletters,
      categories,
      locations,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
