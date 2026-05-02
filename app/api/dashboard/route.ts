import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth-options";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');

  if (!businessId) {
    return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        reviews: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        location: true
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const body = await request.json();
    const { 
      name, description, address, phone, email, website, 
      facebook, zalo, openingHours 
    } = body;

    // Handle Create if businessId is missing
    if (!businessId || businessId === 'undefined' || businessId === 'null') {
      const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7);
      
      const newBusiness = await prisma.business.create({
        data: {
          name,
          slug,
          description,
          address,
          phone,
          email,
          website,
          facebook,
          zalo,
          openingHours,
          userId: session.user.id,
          status: 'PENDING'
        }
      });
      return NextResponse.json(newBusiness);
    }

    // Handle Update
    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(website !== undefined && { website }),
        ...(facebook !== undefined && { facebook }),
        ...(zalo !== undefined && { zalo }),
        ...(openingHours !== undefined && { openingHours }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
