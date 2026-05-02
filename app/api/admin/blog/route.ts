import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';
import { extractBlogContentMetadata, extractProvinceFromContent, injectBlogContentMetadata, stripBlogContentMetadata } from '@/app/lib/blog-post-meta';
import { getSeedViews } from '@/app/lib/auto-views';
import { slugifyVietnamese } from '@/app/lib/slug';

function createSlug(value: string) {
  return slugifyVietnamese(value);
}

async function hasAdminAccess(request: Request) {
  const session = (await cookies()).get('admin_session');
  if (session?.value === 'authenticated') {
    return true;
  }

  // Local AI writer bridge: allows direct import without relying on the login route.
  const headerUsername = request.headers.get('x-admin-username')?.trim();
  const headerPassword = request.headers.get('x-admin-password')?.trim();
  const expectedUsername = (process.env.ADMIN_USERNAME || 'admin').trim();
  const expectedPassword = (process.env.ADMIN_PASSWORD || 'admin').trim();

  return headerUsername === expectedUsername && headerPassword === expectedPassword;
}

export async function GET() {
  try {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = await prisma.blogPost.findMany({
      include: {
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      posts.map((post) => {
        const metadata = extractBlogContentMetadata(post.content);

        return {
          ...post,
          province: extractProvinceFromContent(post.content),
          metaTitle: metadata.metaTitle || '',
          metaDescription: metadata.metaDescription || '',
          targetKeywords: metadata.keywords || [],
          content: stripBlogContentMetadata(post.content),
          tags: post.tags.map(t => t.tag.name), // Just return tag names to frontend
        };
      })
    );
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authorized = await hasAdminAccess(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content: initialContent,
      excerpt,
      image,
      category,
      province,
      status,
      tags,
      slug: reqSlug,
      metaTitle,
      metaDescription,
      targetKeywords,
    } = body;
    let content = initialContent;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }

    // Truncate extremely long content to prevent DB errors (MySQL text limit ~65535 bytes)
    const MAX_CONTENT_LENGTH = 60000;
    if (content.length > MAX_CONTENT_LENGTH) {
      console.warn(`Content truncated from ${content.length} to ${MAX_CONTENT_LENGTH} chars`);
      content = content.substring(0, MAX_CONTENT_LENGTH);
    }

    const baseSlug = reqSlug ? createSlug(reqSlug) : createSlug(title);
    let finalSlug = baseSlug;
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.blogPost.findUnique({
        where: { slug: finalSlug },
        select: { id: true },
      });
      if (!existing) break;
      finalSlug = `${baseSlug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      attempts++;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        content: injectBlogContentMetadata(content, {
          province,
          metaTitle,
          metaDescription,
          keywords: targetKeywords,
        }),
        excerpt,
        image,
        category,
        status: status || 'DRAFT',
        author: 'Admin',
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        views: status === 'PUBLISHED' ? getSeedViews() : 0,
        tags: {
          create: (tags || []).map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName, slug: createSlug(tagName) },
              }
            }
          })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json({
      ...post,
      tags: post.tags.map((t) => t.tag.name)
    });
  } catch (error: unknown) {
    console.error('Blog Create Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json({
      error: 'Operation failed',
      details: message,
      stack: process.env.NODE_ENV === 'development' ? stack : undefined
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      status,
      title,
      content,
      excerpt,
      image,
      category,
      province,
      tags,
      slug: reqSlug,
      metaTitle,
      metaDescription,
      targetKeywords,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const currentPost = await prisma.blogPost.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    });

    if (!currentPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const currentMetadata = extractBlogContentMetadata(currentPost.content);
    let finalSlug: string | undefined;
    if (reqSlug) {
      const baseSlug = createSlug(reqSlug);
      finalSlug = baseSlug;
      let attempts = 0;
      while (attempts < 10) {
        const existingPost = await prisma.blogPost.findFirst({
          where: { slug: finalSlug, NOT: { id } },
          select: { id: true },
        });
        if (!existingPost) break;
        finalSlug = `${baseSlug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        attempts++;
      }
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(status && {
          status,
          publishedAt: status === 'PUBLISHED'
            ? currentPost.publishedAt || new Date()
            : status === 'DRAFT'
              ? null
              : undefined,
          // Add seed views when publishing for the first time
          views: status === 'PUBLISHED' && currentPost.status !== 'PUBLISHED'
            ? getSeedViews()
            : undefined
        }),
        ...(title && { title }),
        ...(finalSlug && { slug: finalSlug }),
        ...((content !== undefined || province !== undefined) && {
          content: injectBlogContentMetadata(content ?? currentPost.content, {
            province: province ?? currentMetadata.province,
            metaTitle: metaTitle ?? currentMetadata.metaTitle,
            metaDescription: metaDescription ?? currentMetadata.metaDescription,
            keywords: targetKeywords ?? currentMetadata.keywords,
          }),
        }),
        ...((content === undefined && province === undefined && (metaTitle !== undefined || metaDescription !== undefined || targetKeywords !== undefined)) && {
          content: injectBlogContentMetadata(currentPost.content, {
            province: currentMetadata.province,
            metaTitle: metaTitle ?? currentMetadata.metaTitle,
            metaDescription: metaDescription ?? currentMetadata.metaDescription,
            keywords: targetKeywords ?? currentMetadata.keywords,
          }),
        }),
        ...(excerpt !== undefined && { excerpt }),
        ...(image !== undefined && { image }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && {
          tags: {
            deleteMany: {}, // Clear existing tags in the join table
            create: tags.map((tagName: string) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName, slug: createSlug(tagName) },
                }
              }
            })),
          },
        }),
      },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json({
      ...updated,
      tags: updated.tags.map((t) => t.tag.name)
    });
  } catch (error) {
    console.error('Blog Patch Error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog Delete Error:', error);
    return NextResponse.json({ error: 'Operation failed', details: String(error) }, { status: 500 });
  }
}
