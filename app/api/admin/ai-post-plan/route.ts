import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';
import {
  buildPrompt,
  parseAIResponse,
  sanitizeHtml,
  replaceAllImageMarkers,
} from '@/app/lib/ai-prompts';
import { injectProvinceIntoContent } from '@/app/lib/blog-post-meta';
import { getSeedViews } from '@/app/lib/auto-views';
import { slugifyVietnamese } from '@/app/lib/slug';

async function hasAdminAccess() {
  const session = (await cookies()).get('admin_session');
  return session?.value === 'authenticated';
}

function isUniqueConstraintError(error: unknown): error is { code: string; meta?: { target?: string[] } } {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002';
}

function createSlug(value: string) {
  return slugifyVietnamese(value);
}

function makeUniqueSlug(baseSlug: string) {
  return `${baseSlug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function getOrCreateTags(tagNames: string[]) {
  const uniqueTagNames = Array.from(
    new Set(
      tagNames
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );

  const tagIds: string[] = [];

  for (const tagName of uniqueTagNames) {
    const existingByName = await prisma.tag.findUnique({
      where: { name: tagName },
      select: { id: true }
    });

    if (existingByName) {
      tagIds.push(existingByName.id);
      continue;
    }

    const baseSlug = createSlug(tagName) || 'tag';
    let slug = baseSlug;
    let retryCount = 0;
    const maxRetries = 6;

    while (retryCount < maxRetries) {
      try {
        const createdTag = await prisma.tag.create({
          data: { name: tagName, slug },
          select: { id: true }
        });
        tagIds.push(createdTag.id);
        break;
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          const existingName = await prisma.tag.findUnique({
            where: { name: tagName },
            select: { id: true }
          });

          if (existingName) {
            tagIds.push(existingName.id);
            break;
          }

          slug = makeUniqueSlug(baseSlug);
          retryCount++;
          continue;
        }

        throw error;
      }
    }
  }

  return tagIds;
}

export async function GET() {
  try {
    if (!await hasAdminAccess()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plans = await prisma.aiPostPlan.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(plans);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!await hasAdminAccess()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, rewrite } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
    }

    const plan = await prisma.aiPostPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (rewrite && plan.status === 'COMPLETED' && plan.postId) {
      try {
        await prisma.blogPost.delete({ where: { id: plan.postId } });
      } catch (e) {
        console.error('Failed to delete old post:', e);
      }

      await prisma.aiPostPlan.update({
        where: { id: planId },
        data: { status: 'PENDING', postId: null }
      });
    } else if (plan.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Plan already completed' }, { status: 400 });
    }

    await prisma.aiPostPlan.update({
      where: { id: planId },
      data: { status: 'GENERATING' }
    });

    const dbSettings = await prisma.systemSetting.findMany();
    const settingsMap = dbSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const XAI_URL = settingsMap.ai_url;
    const XAI_MODEL = settingsMap.ai_model;
    const XAI_API_KEY = settingsMap.ai_key;

    if (!XAI_URL || !XAI_MODEL || !XAI_API_KEY) {
      await prisma.aiPostPlan.update({ where: { id: planId }, data: { status: 'FAILED' } });
      return NextResponse.json({ error: 'AI settings not configured. Go to Settings tab.' }, { status: 400 });
    }

    const allCategories = await prisma.category.findMany({
      select: { name: true },
      orderBy: { order: 'asc' }
    });
    const categoryNames = allCategories.map((c) => c.name);

    const prompt = buildPrompt({
      topic: plan.title,
      templateType: 'review',
      tone: 'expert',
      includeFaq: true,
      includeStructuredData: true,
      categories: categoryNames
    });

    const isChatCompletions = XAI_URL.includes('/chat/completions');
    const isGemini = XAI_URL.includes('generativelanguage.googleapis.com');
    const isNvidia = XAI_URL.includes('nvidia.com');

    let requestBody: Record<string, unknown>;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (isGemini) {
      requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 16000 }
      };
    } else if (isChatCompletions || isNvidia) {
      requestBody = {
        model: XAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 16000,
        stream: false
      };
      headers.Authorization = `Bearer ${XAI_API_KEY}`;
    } else {
      requestBody = {
        model: XAI_MODEL,
        input: prompt
      };
      headers.Authorization = `Bearer ${XAI_API_KEY}`;
    }

    const fetchUrl = isGemini ? `${XAI_URL}?key=${XAI_API_KEY}` : XAI_URL;

    const aiRes = await fetch(fetchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text().catch(() => 'no error body');
      console.error('AI API Error:', aiRes.status, errorText);
      await prisma.aiPostPlan.update({ where: { id: planId }, data: { status: 'FAILED' } });
      return NextResponse.json({ error: `AI API failed: ${aiRes.status}`, details: errorText.slice(0, 500) }, { status: 502 });
    }

    const aiData = await aiRes.json();

    let aiResponse: string | null = null;

    if (isGemini) {
      aiResponse = aiData.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } else if (isChatCompletions) {
      aiResponse = aiData.choices?.[0]?.message?.content || null;
    } else {
      const outputArray = aiData.output || aiData;
      if (Array.isArray(outputArray)) {
        const messageObj = outputArray.find((item: any) => item.type === 'message');
        if (messageObj?.content?.[0]?.text) {
          aiResponse = messageObj.content[0].text;
        }
      } else if (typeof aiData.output === 'string') {
        aiResponse = aiData.output;
      }
    }

    if (!aiResponse) {
      console.error('AI Response structure:', JSON.stringify(aiData).slice(0, 500));
      await prisma.aiPostPlan.update({ where: { id: planId }, data: { status: 'FAILED' } });
      return NextResponse.json({ error: 'Empty AI response' }, { status: 502 });
    }

    const parsed = parseAIResponse(aiResponse);
    if (!parsed) {
      await prisma.aiPostPlan.update({ where: { id: planId }, data: { status: 'FAILED' } });
      return NextResponse.json({ error: 'Parse failed' }, { status: 422 });
    }

    const sanitizedContent = sanitizeHtml(parsed.content);
    const contentWithImages = replaceAllImageMarkers(sanitizedContent);
    const baseSlug = createSlug(parsed.title) || 'ai-post';
    const tagIds = await getOrCreateTags(parsed.tags || []);

    let post: Awaited<ReturnType<typeof prisma.blogPost.create>> | null = null;
    let slug = baseSlug;
    let retryCount = 0;
    const maxRetries = 6;

    while (retryCount < maxRetries) {
      const existing = await prisma.blogPost.findUnique({ where: { slug } });
      if (existing) {
        slug = makeUniqueSlug(baseSlug);
        retryCount++;
        continue;
      }

      try {
        post = await prisma.blogPost.create({
          data: {
            title: parsed.title,
            slug,
            excerpt: parsed.excerpt,
            content: injectProvinceIntoContent(contentWithImages, ''),
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200',
            category: parsed.category || 'Blog',
            status: 'PUBLISHED',
            publishedAt: new Date(),
            views: getSeedViews(),
            author: 'Địa Điểm Hot',
            tags: {
              create: tagIds.map((tagId) => ({
                tag: {
                  connect: { id: tagId }
                }
              })),
            },
          }
        });
        break;
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          const target = Array.isArray(error.meta?.target) ? error.meta?.target : [];
          if (target.includes('slug')) {
            slug = makeUniqueSlug(baseSlug);
            retryCount++;
            continue;
          }
        }
        throw error;
      }
    }

    if (!post) {
      await prisma.aiPostPlan.update({ where: { id: planId }, data: { status: 'FAILED' } });
      return NextResponse.json({ error: 'Failed to generate unique slug for post' }, { status: 500 });
    }

    await prisma.aiPostPlan.update({
      where: { id: planId },
      data: {
        status: 'COMPLETED',
        postId: post.id
      }
    });

    return NextResponse.json({ success: true, postId: post.id });
  } catch (error) {
    console.error('AI Plan Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
