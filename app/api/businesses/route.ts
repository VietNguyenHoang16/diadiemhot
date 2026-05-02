import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

// GET /api/businesses - Public endpoint to list featured businesses
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const industry = searchParams.get('industry');
    const province = searchParams.get('province');
    const sortBy = searchParams.get('sortBy') || 'rating';

    const where: Record<string, unknown> = {
      status: 'ACTIVE',
      ...(industry && { industryId: industry }),
      ...(province && { provinceId: province }),
    };

    const orderBy: Record<string, string> = {};
    if (sortBy === 'rating') orderBy.rating = 'desc';
    else if (sortBy === 'reviews') orderBy.reviewCount = 'desc';
    else if (sortBy === 'views') orderBy.views = 'desc';
    else orderBy.createdAt = 'desc';

    const businesses = await prisma.business.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        user: { select: { name: true } },
        province: { select: { name: true } },
        industry: { select: { name: true } },
      },
    });

    return NextResponse(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}