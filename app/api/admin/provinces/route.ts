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

// GET /api/admin/provinces - List all provinces
export async function GET(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');
    const search = searchParams.get('search') || '';

    const provinces = await prisma.province.findMany({
      where: {
        AND: [
          regionId ? { regionId } : {},
          search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { code: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      orderBy: { order: 'asc' },
      include: {
        region: {
          select: { id: true, name: true },
        },
        _count: {
          select: { locations: true, posts: true },
        },
      },
    });

    return NextResponse.json(provinces);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
}

// POST /api/admin/provinces - Create new province (usually done via seed, but for completeness)
export async function POST(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, code, regionId, order = 0 } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');

    // Check if slug already exists
    const existing = await prisma.province.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Province with this name already exists' },
        { status: 409 }
      );
    }

    const province = await prisma.province.create({
      data: {
        name,
        slug,
        code,
        regionId,
        order,
      },
    });

    return NextResponse.json(province, { status: 201 });
  } catch (error) {
    console.error('Error creating province:', error);
    return NextResponse.json(
      { error: 'Failed to create province' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/provinces - Update province (mainly to assign region)
export async function PATCH(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, code, regionId, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Province ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-');
    }
    if (code !== undefined) updateData.code = code;
    if (regionId !== undefined) updateData.regionId = regionId;
    if (order !== undefined) updateData.order = order;

    const province = await prisma.province.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(province);
  } catch (error) {
    console.error('Error updating province:', error);
    return NextResponse.json(
      { error: 'Failed to update province' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/provinces - Delete province
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
        { error: 'Province ID is required' },
        { status: 400 }
      );
    }

    // Check if province has locations or posts
    const province = await prisma.province.findUnique({
      where: { id },
      include: {
        _count: { select: { locations: true, posts: true } },
      },
    });

    const linkedCount = (province?._count.locations || 0) + (province?._count.posts || 0);
    
    if (linkedCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete province with ${linkedCount} linked items` },
        { status: 409 }
      );
    }

    await prisma.province.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting province:', error);
    return NextResponse.json(
      { error: 'Failed to delete province' },
      { status: 500 }
    );
  }
}

// POST /api/admin/provinces/bulk-assign - Bulk assign provinces to region
export async function POST_BULK_ASSIGN(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provinceIds, regionId } = body;

    if (!Array.isArray(provinceIds) || !regionId) {
      return NextResponse.json(
        { error: 'provinceIds array and regionId are required' },
        { status: 400 }
      );
    }

    // Update all provinces in transaction
    await prisma.$transaction(
      provinceIds.map((id: string) =>
        prisma.province.update({
          where: { id },
          data: { regionId },
        })
      )
    );

    return NextResponse.json({ 
      success: true, 
      count: provinceIds.length 
    });
  } catch (error) {
    console.error('Error bulk assigning provinces:', error);
    return NextResponse.json(
      { error: 'Failed to bulk assign provinces' },
      { status: 500 }
    );
  }
}
