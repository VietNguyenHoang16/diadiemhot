import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArrowLeft, Eye, MapPin } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { normalizeLegacyFigurePlaceholders } from '@/app/lib/image-placeholders';
import { getPublicBlogPostBySlug } from '@/app/lib/blog-posts';
import { toAbsoluteImageUrl } from '@/app/lib/site-config';

export const dynamic = 'force-dynamic';

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

export default async function PreviewBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = (await cookies()).get('admin_session');
  if (session?.value !== 'authenticated') {
    notFound();
  }

  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const title = post.title;
  const excerpt = post.excerpt || '';
  const category = post.category || 'Blog';
  const province = post.provinceName || '';
  const image = post.image || toAbsoluteImageUrl('');
  const content = renderContentWithCaptions(normalizeLegacyFigurePlaceholders(post.cleanContent || ''));

  return (
    <main className="min-h-screen bg-white">
      <Header showNewsTicker={false} />

      <div className="mx-auto max-w-screen-xl px-4 pb-16 pt-24 sm:px-6 md:px-8 lg:pt-28">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Ban dang xem che do preview noi bo cho bai viet {post.status === 'PUBLISHED' ? 'da xuat ban' : 'nhap'}.</span>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="rounded-full bg-white px-4 py-2 text-xs uppercase tracking-widest text-[#00173a] shadow-sm transition-colors hover:bg-[#00173a] hover:text-white"
          >
            Xem public route
          </Link>
        </div>

        <Link
          href="/admin?tab=blog"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-[#bb0012]"
        >
          <ArrowLeft className="h-4 w-4" />
          Ve admin
        </Link>

        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <span className="inline-block rounded-full bg-[#bb0012] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
              {category}
            </span>
            {province ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                <MapPin className="h-3 w-3" />
                {province}
              </span>
            ) : null}
          </div>

          <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-[#00173a] md:text-4xl lg:text-5xl">
            {title}
          </h1>

          {excerpt ? (
            <p className="mt-4 text-lg leading-relaxed text-slate-600 md:text-xl">
              {excerpt}
            </p>
          ) : null}
        </header>

        {image ? (
          <figure className="mb-10 overflow-hidden rounded-3xl bg-slate-100">
            <img
              src={image}
              alt={title}
              className="h-full max-h-[480px] w-full object-cover"
            />
          </figure>
        ) : null}

        <article
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <Footer />
    </main>
  );
}
