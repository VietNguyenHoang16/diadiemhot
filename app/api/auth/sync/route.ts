import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: Request) {
  try {
    const { email, name, image } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { business: true }
    });

    if (!user) {
      const businessName = name?.split(' ')[0] || 'Doanh nghiệp';
      let slug = generateSlug(businessName);
      const existingSlug = await prisma.business.findUnique({ where: { slug } });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }

      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          avatar: image || null,
          role: 'BUSINESS',
          business: {
            create: {
              name: businessName,
              slug,
              status: 'PENDING',
            }
          }
        },
        include: { business: true }
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role.toLowerCase(),
      businessId: user.business?.id || null,
      businessName: user.business?.name || null,
    });
  } catch (error) {
    console.error('OAuth sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
