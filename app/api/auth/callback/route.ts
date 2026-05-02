import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/dang-nhap', request.url));
    }

    const { email, name, image } = session.user;

    let user = await prisma.user.findUnique({
      where: { email },
      include: { business: true }
    });

    if (!user) {
      const businessName = name?.split(' ')[0] || 'Doanh nghiệp';
      const slug = businessName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

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

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role.toLowerCase(),
      businessId: user.business?.id || null,
      businessName: user.business?.name || null,
    };

    const redirectUrl = new URL('/dashboard', request.url);
    redirectUrl.searchParams.set('userData', JSON.stringify(userData));
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/dang-nhap', request.url));
  }
}
