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

// GET /api/admin/regions - List all regions with provinces
export async function GET() {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const regions = await prisma.region.findMany({
      orderBy: { order: 'asc' },
      include: {
        provinces: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { locations: true, posts: true },
            },
          },
        },
      },
    });

    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
}

// POST /api/admin/regions - Create new region
export async function POST(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, order = 0 } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    // Check if slug already exists
    const existing = await prisma.region.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Region with this name already exists' },
        { status: 409 }
      );
    }

    const region = await prisma.region.create({
      data: {
        name,
        slug,
        order,
      },
    });

    return NextResponse.json(region, { status: 201 });
  } catch (error) {
    console.error('Error creating region:', error);
    return NextResponse.json(
      { error: 'Failed to create region' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/regions - Update region
export async function PATCH(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Region ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    if (order !== undefined) updateData.order = order;

    const region = await prisma.region.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(region);
  } catch (error) {
    console.error('Error updating region:', error);
    return NextResponse.json(
      { error: 'Failed to update region' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/regions - Delete region
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
        { error: 'Region ID is required' },
        { status: 400 }
      );
    }

    // Check if region has provinces
    const region = await prisma.region.findUnique({
      where: { id },
      include: {
        _count: { select: { provinces: true } },
      },
    });

    if (region?._count.provinces && region._count.provinces > 0) {
      return NextResponse.json(
        { error: 'Cannot delete region with associated provinces' },
        { status: 409 }
      );
    }

    await prisma.region.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting region:', error);
    return NextResponse.json(
      { error: 'Failed to delete region' },
      { status: 500 }
    );
  }
}
