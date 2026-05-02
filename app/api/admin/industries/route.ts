import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';

// Helper: Check admin auth
async function checkAdminAuth() {
  const session = (await cookies()).get('admin_session');
  if (!session || session.value !== 'authenticated') {
    return false;
  }
  return true;
}

// Helper: Generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

// GET /api/admin/industries - List all industries
export async function GET(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const industries = await prisma.industry.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { businesses: true, posts: true },
        },
      },
    });

    return NextResponse.json(industries);
  } catch (error) {
    console.error('Error fetching industries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch industries' },
      { status: 500 }
    );
  }
}

// POST /api/admin/industries - Create new industry
export async function POST(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon, description, order = 0 } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!icon || typeof icon !== 'string') {
      return NextResponse.json(
        { error: 'Icon is required' },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    // Check if slug already exists
    const existing = await prisma.industry.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Industry with this name already exists' },
        { status: 409 }
      );
    }

    const industry = await prisma.industry.create({
      data: {
        name,
        slug,
        icon,
        description,
        order,
      },
    });

    return NextResponse.json(industry, { status: 201 });
  } catch (error) {
    console.error('Error creating industry:', error);
    return NextResponse.json(
      { error: 'Failed to create industry' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/industries - Update industry
export async function PATCH(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, icon, description, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Industry ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    if (icon !== undefined) updateData.icon = icon;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;

    const industry = await prisma.industry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(industry);
  } catch (error) {
    console.error('Error updating industry:', error);
    return NextResponse.json(
      { error: 'Failed to update industry' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/industries - Delete industry
export async function DELETE(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Industry ID is required' },
        { status: 400 }
      );
    }

    // Check if industry has businesses or posts
    const industry = await prisma.industry.findUnique({
      where: { id },
      include: {
        _count: { select: { businesses: true, posts: true } },
      },
    });

    const linkedCount = (industry?._count.businesses || 0) + (industry?._count.posts || 0);
    
    if (linkedCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete industry with ${linkedCount} linked items` },
        { status: 409 }
      );
    }

    await prisma.industry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting industry:', error);
    return NextResponse.json(
      { error: 'Failed to delete industry' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/industries/reorder - Reorder industries
export async function PATCH_REORDER(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body; // [{ id: string, order: number }]

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Update all orders in transaction
    await prisma.$transaction(
      items.map((item: { id: string; order: number }) =>
        prisma.industry.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering industries:', error);
    return NextResponse.json(
      { error: 'Failed to reorder industries' },
      { status: 500 }
    );
  }
}
