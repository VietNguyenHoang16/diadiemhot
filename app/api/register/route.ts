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
    const { email, password, name, phone, businessName } = await request.json();

    if (!email || !password || !name || !businessName) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 400 });
    }

    let slug = generateSlug(businessName);
    const existingSlug = await prisma.business.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password,
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

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase(),
      businessId: user.business?.id || null,
      businessName: user.business?.name || null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
