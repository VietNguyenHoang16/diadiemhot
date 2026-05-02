import { NextResponse } from 'next/server';
import { subscribeNewsletter } from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    await subscribeNewsletter(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ error: 'Subscribe failed' }, { status: 500 });
  }
}
