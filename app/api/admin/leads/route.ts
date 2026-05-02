import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';
import { sendLeadNotification } from '@/app/lib/email';

export async function GET() {
  try {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, businessName, contactName, package: pkg, description } = body;

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone required' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        email: email || phone || 'N/A',
        phone: phone || email || 'N/A',
        businessName: businessName || 'N/A',
        contactName: contactName || 'N/A',
        package: pkg || 'N/A',
        description: description || '',
        status: 'PENDING',
      },
    });

    // Send email notification (non-blocking)
    sendLeadNotification({ email, phone, businessName, contactName, package: pkg, description });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedLead);
  } catch {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
