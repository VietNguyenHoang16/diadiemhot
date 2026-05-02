import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Eye, Tag, ChevronRight, MapPin } from 'lucide-react';
import { prisma } from '@/app/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ArticleShareButtons from '@/app/components/ArticleShareButtons';
import ContactForm from '@/app/components/ContactForm';
import { calculateExpectedViews } from '@/app/lib/auto-views';
import { normalizeLegacyFigurePlaceholders } from '@/app/lib/image-placeholders';
import {
  getPublicBlogPostBySlug,
  getPublishedBlogPostBySlug,
} from '@/app/lib/blog-posts';
import {
  SITE_AUTHOR,
  SITE_NAME,
  buildDescription,
  extractFaqFromHtml,
  getAbsoluteUrl,
  toAbsoluteImageUrl,
  uniqKeywords,
} from '@/app/lib/site-config';

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function escapeHtmlText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderContentWithCaptions(content: string) {
  return content.replace(/<img\b([^>]*?)data-caption="([^"]+)"([^>]*)>(?!\s*<(?:p|figcaption)\b)/gi, (match, before, rawCaption, after) => {
    const normalizedCaption = escapeHtmlText(decodeHtmlEntities(rawCaption).trim());
    if (!normalizedCaption) return match;

    const trailingContent = after || '';
    if (/data-placeholder="true"/i.test(`${before}${trailingContent}`)) {
      return match;
    }

    return `${match}<p><em>${normalizedCaption}</em></p>`;
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const metaTitle = post.metaTitle || post.title;
  const metaDescription = post.metaDescription || buildDescription(post.excerpt, post.cleanContent, post.title);
  const keywords = uniqKeywords([
    ...post.targetKeywords,
    post.title,
  ]);
  const canonicalUrl = getAbsoluteUrl(`/blog/${post.slug}`);
  const ogImage = toAbsoluteImageUrl(post.image);
  const author = post.author?.trim() || SITE_AUTHOR;
  const publishedIso = (post.publishedAt || post.createdAt).toISOString();
  const updatedIso = post.updatedAt.toISOString();

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    authors: [{ name: author }],
    creator: author,
    publisher: SITE_NAME,
    category: post.category || undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'article',
      locale: 'vi_VN',
      url: canonicalUrl,
      title: metaTitle,
      description: metaDescription,
      siteName: SITE_NAME,
      publishedTime: publishedIso,
      modifiedTime: updatedIso,
      authors: [author],
      section: post.category || undefined,
      tags: keywords,
      images: [
        {
          url: ogImage,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = (await cookies()).get('admin_session');
  const isAdmin = session?.value === 'authenticated';

  const post = isAdmin
    ? await getPublicBlogPostBySlug(slug)
    : await getPublishedBlogPostBySlug(slug);

  if (!post || (post.status !== 'PUBLISHED' && !isAdmin)) {
    notFound();
  }

  const [randomPosts, morePosts] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        NOT: { id: post.id },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        image: true,
        category: true,
        excerpt: true,
      },
      take: 5,
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    }),
    prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        NOT: { id: post.id },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        image: true,
        category: true,
      },
      take: 4,
      orderBy: [
        { updatedAt: 'desc' },
        { publishedAt: 'desc' },
      ],
    }),
  ]);

  const title = post.title;
  const excerpt = post.excerpt || '';
  const content = renderContentWithCaptions(normalizeLegacyFigurePlaceholders(post.cleanContent || ''));
  const image = post.image || toAbsoluteImageUrl('');
  const category = post.category || 'Blog';
  const province = post.provinceName || '';
  const shareUrl = getAbsoluteUrl(`/blog/${post.slug}`);
  const author = post.author?.trim() || SITE_AUTHOR;
  const views = post.status === 'PUBLISHED'
    ? calculateExpectedViews(post.publishedAt) + (post.views || 0)
    : 0;
  const publishedDateValue = post.publishedAt || post.createdAt;
  const publishedIso = publishedDateValue.toISOString();
  const updatedIso = post.updatedAt.toISOString();
  const keywordList = uniqKeywords([...post.targetKeywords, title]);
  const faqItems = extractFaqFromHtml(content);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metaTitle || title,
    description: post.metaDescription || buildDescription(post.excerpt, post.cleanContent, title),
    image: [toAbsoluteImageUrl(post.image)],
    datePublished: publishedIso,
    dateModified: updatedIso,
    inLanguage: 'vi-VN',
    mainEntityOfPage: shareUrl,
    articleSection: category,
    keywords: keywordList.join(', '),
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: getAbsoluteUrl('/'),
    },
    ...(province ? {
      contentLocation: {
        '@type': 'Place',
        name: province,
      },
    } : {}),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: getAbsoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: getAbsoluteUrl('/blog'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: shareUrl,
      },
    ],
  };

  const faqJsonLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } : null;

  return (
    <main className="min-h-screen bg-white">
      <Header showNewsTicker={true} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="max-w-screen-xl mx-auto pt-28 px-4 md:px-8 pb-16">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <Link href="/" className="hover:text-[#bb0012]">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/blog" className="hover:text-[#bb0012]">Blog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#00173a] line-clamp-1">{title}</span>
        </nav>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Link href={`/blog?category=${encodeURIComponent(category)}`} className="inline-block bg-[#bb0012] px-3 py-1 text-xs font-bold text-white uppercase tracking-widest">
              {category}
            </Link>
            {province && (
              <Link href={`/blog?province=${encodeURIComponent(province)}`} className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#bb0012]">
                <MapPin className="w-3 h-3" />
                {province}
              </Link>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#00173a] leading-[1.1] tracking-tight mb-4">
            {title}
          </h1>

          {excerpt && (
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-4">
              {excerpt}
            </p>
          )}

          <div className="flex items-center justify-between py-3 border-t border-b border-slate-200">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700">
                <span className="text-slate-500">By</span> {author}
              </span>
              <div className="flex items-center gap-1 text-slate-500">
                <Eye className="w-4 h-4" />
                <span suppressHydrationWarning className="text-sm">{views.toLocaleString('vi-VN')} lượt xem</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chia sẻ:</span>
              <ArticleShareButtons title={title} url={shareUrl} />
            </div>
          </div>
        </header>

        <figure className="mb-10 w-full">
          <div className="w-full bg-slate-200 overflow-hidden rounded-lg" style={{ maxHeight: '480px' }}>
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              style={{ maxHeight: '480px', width: '100%', display: 'block' }}
              loading="eager"
            />
          </div>
          <figcaption className="text-sm text-slate-500 mt-3 text-center font-semibold italic">
            {title}
          </figcaption>
        </figure>

        <div className="grid grid-cols-12 gap-8">
          <article id="article-body" className="col-span-12 lg:col-span-8">
            <div
              suppressHydrationWarning
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            <div suppressHydrationWarning className="flex flex-wrap gap-2 pt-6 border-t border-slate-200 mt-10" role="list" aria-label="Tags">
              <Tag className="w-4 h-4 text-slate-500 mr-2" />
              <Link href={`/blog?category=${encodeURIComponent(category)}`} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-[#bb0012] hover:text-white transition-colors rounded" role="listitem">#{category}</Link>
              {province && (
                <Link href={`/blog?province=${encodeURIComponent(province)}`} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-[#bb0012] hover:text-white transition-colors rounded" role="listitem">
                  #{province}
                </Link>
              )}
              {post.tagNames.map((tagName) => (
                <span key={tagName} className="px-3 py-1.5 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider rounded" role="listitem">
                  #{tagName}
                </span>
              ))}
            </div>

            <div className="mt-10 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#00173a] text-white rounded-full flex items-center justify-center text-xl font-black shrink-0">
                  {author.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#00173a]">{author}</p>
                  <p className="text-sm text-slate-500">Ban biên tập - {SITE_NAME}</p>
                </div>
                <ArticleShareButtons title={title} url={shareUrl} compact={true} />
              </div>
            </div>
          </article>

          <aside className="col-span-12 lg:col-span-4 space-y-8 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-slate-300 lg:scrollbar-track-transparent">
            <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-[#00173a] text-white px-4 py-3">
                <p className="font-black uppercase tracking-wider text-sm">Đừng Bỏ Lỡ</p>
              </div>
              <div className="divide-y divide-slate-100">
                {randomPosts.length > 0 ? randomPosts.slice(0, 4).map((item) => (
                  <Link key={item.id} href={`/blog/${item.slug}`} className="flex gap-3 p-4 hover:bg-slate-50 transition-colors group">
                    <div className="w-20 h-16 bg-slate-200 rounded overflow-hidden shrink-0">
                      <img src={item.image || toAbsoluteImageUrl('')} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#bb0012] uppercase tracking-widest">{item.category || 'Blog'}</span>
                      <p className="text-sm font-bold text-[#00173a] leading-tight line-clamp-2 group-hover:text-[#bb0012] transition-colors mt-1">{item.title}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-400 line-clamp-2">{item.excerpt || 'Khám phá thêm bài viết liên quan.'}</p>
                    </div>
                  </Link>
                )) : (
                  <p className="text-sm text-slate-400 p-4">Chưa có bài viết liên quan.</p>
                )}
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#00173a] to-[#002b61] p-6 rounded-lg shadow-lg border border-[#bb0012]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#bb0012]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <p className="text-xs font-black text-[#bb0012] uppercase tracking-widest mb-2">Quảng Cáo</p>
                <p className="text-lg font-black text-white uppercase tracking-tight mb-2 leading-tight">
                  Đăng Ký Quảng Cáo<br />
                  <span className="text-[#bb0012]">Trên {SITE_NAME}</span>
                </p>
                <p className="text-xs text-white/60 mb-4 leading-relaxed">Tiếp cận hàng nghìn khách hàng tiềm năng mỗi ngày.</p>
                <a href="#article-ad-form" className="block w-full bg-[#bb0012] text-white text-xs font-bold uppercase tracking-widest py-3 rounded hover:bg-white hover:text-[#bb0012] transition-colors text-center">
                  Đăng Ký Ngay
                </a>
              </div>
            </section>
            <section id="article-ad-form" className="rounded-lg border border-slate-200 bg-[#00173a] p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-[#bb0012]">Đăng Ký Tư Vấn</p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Để lại email hoặc số điện thoại, chúng tôi sẽ liên hệ tư vấn quảng cáo cho doanh nghiệp bạn , đảm bảo tăng trưởng doanh thu vượt trội.
              </p>
              <div className="mt-4">
                <ContactForm
                  buttonText="Đăng Ký Ngay"
                  leadPackage="Quảng cáo bài viết"
                  leadDescription={`Đăng ký quảng cáo từ bài viết: ${title} (${shareUrl})`}
                />
              </div>
            </section>
          </aside>
        </div>

        {morePosts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-[#00173a] uppercase tracking-tight">Đọc Thêm</h2>
              <Link href="/blog" className="text-sm font-bold text-[#bb0012] uppercase tracking-widest hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {morePosts.map((item) => (
                <Link key={item.id} href={`/blog/${item.slug}`} className="group">
                  <div className="aspect-[4/3] bg-slate-200 rounded-lg overflow-hidden mb-3">
                    <img src={item.image || toAbsoluteImageUrl('')} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <span className="text-[10px] font-bold text-[#bb0012] uppercase tracking-widest">{item.category || 'Blog'}</span>
                  <p className="text-sm font-bold text-[#00173a] leading-tight mt-1 group-hover:text-[#bb0012] transition-colors line-clamp-2">{item.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}
