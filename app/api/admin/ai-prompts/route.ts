import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';

async function checkAuth() {
  const session = (await cookies()).get('admin_session');
  return session?.value === 'authenticated';
}

export async function GET() {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prompts = await prisma.aiWriterPrompt.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Prompts GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, content } = body;

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content required' }, { status: 400 });
    }

    const updated = await prisma.aiWriterPrompt.upsert({
      where: { name },
      update: { content },
      create: { name, content },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Prompts PATCH Error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

// Bulk update for initial migration
export async function POST(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prompts } = body; // Expected: [{ name, content }]

    if (!Array.isArray(prompts)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    const updatePromises = prompts.map(p => {
      return prisma.aiWriterPrompt.upsert({
        where: { name: p.name },
        update: { content: p.content },
        create: { name: p.name, content: p.content },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prompts POST Error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
