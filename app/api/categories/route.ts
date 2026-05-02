import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { safePublicDbQuery } from '@/app/lib/public-db';

// GET /api/categories - Public endpoint to list all categories
export async function GET() {
  const categories = await safePublicDbQuery('api-categories', [], () =>
    prisma.category.findMany({
      orderBy: { order: 'asc' },
    })
  );

  return NextResponse.json(categories);
}
