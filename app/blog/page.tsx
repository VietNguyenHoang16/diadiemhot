import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import ContactForm from '@/app/components/ContactForm';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { getPublishedBlogIndexPosts } from '@/app/lib/blog-posts';
import { SITE_DESCRIPTION, SITE_NAME, getAbsoluteUrl } from '@/app/lib/site-config';
import BlogIndexContent from './BlogIndexContent';

export const revalidate = 3600;

const allLabel = 'Tất Cả';

export const metadata: Metadata = {
  title: 'Blog địa điểm, review và cẩm nang du lịch',
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/blog',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: getAbsoluteUrl('/blog'),
    title: 'Blog địa điểm, review và cẩm nang du lịch',
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog địa điểm, review và cẩm nang du lịch',
    description: SITE_DESCRIPTION,
  },
};

function BlogIndexFallback() {
  return (
    <div className="space-y-10">
      <section className="border-b border-slate-100 py-12 text-left">
        <div className="h-14 w-full max-w-2xl animate-pulse rounded bg-slate-100" />
        <div className="mt-4 h-6 w-full max-w-3xl animate-pulse rounded bg-slate-100" />
      </section>

      <section className="space-y-4 border-b border-slate-50 bg-white/90 py-4">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-10 w-28 animate-pulse rounded-full bg-slate-100" />
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <div className="h-10 w-full animate-pulse rounded-full bg-slate-100 sm:w-56" />
          <div className="h-10 w-full animate-pulse rounded-full bg-slate-100 sm:w-32" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-5">
            <div className="aspect-[4/3] animate-pulse rounded-[2.5rem] bg-slate-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-8 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </section>
    </div>
  );
}

export default async function BlogPage() {
  const allPosts = await getPublishedBlogIndexPosts();
  const categories = [
    { name: allLabel, count: allPosts.length },
    ...Array.from(
      allPosts.reduce((map, post) => {
        const key = post.category?.trim();
        if (!key) return map;
        map.set(key, (map.get(key) || 0) + 1);
        return map;
      }, new Map<string, number>())
    ).map(([name, count]) => ({ name, count })),
  ];

  const provinces = Array.from(
    new Set(
      allPosts
        .map((post) => post.provinceName)
        .filter((item): item is string => Boolean(item))
    )
  ).sort((a, b) => a.localeCompare(b, 'vi'));

  return (
    <main className="min-h-screen bg-white">
      <Header showNewsTicker={true} activeLink="blog" />

      <div className="mx-auto max-w-screen-2xl overflow-x-clip px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          <div className="col-span-12 min-w-0 lg:col-span-9">
            <Suspense fallback={<BlogIndexFallback />}>
              <BlogIndexContent
                allLabel={allLabel}
                allPosts={allPosts}
                categories={categories}
                provinces={provinces}
              />
            </Suspense>
          </div>

          <aside className="col-span-12 min-w-0 space-y-12 lg:col-span-3">
            <div className="rounded-[3rem] bg-[#00173a] p-6 text-white shadow-2xl shadow-[#00173a]/20 sm:p-10">
              <h2 className="mb-2 text-xl font-black uppercase tracking-tighter">Bản Tin</h2>
              <p className="mb-8 text-xs font-bold uppercase tracking-widest text-white/50">
                Nhận những địa điểm hot nhất qua email
              </p>
              <ContactForm buttonText="Tham Gia Ngay" />
            </div>

            <section>
              <h2 className="mb-8 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#00173a]">
                <span className="h-1 w-10 rounded-full bg-[#bb0012]" />
                Xu Hướng
              </h2>
              <div className="space-y-8">
                {allPosts.slice(0, 5).map((post, index) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-5">
                    <span className="text-3xl font-black text-slate-100 transition-colors group-hover:text-[#bb0012]">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3 className="mb-2 text-sm font-black italic leading-tight text-[#00173a] group-hover:underline">
                        {post.title}
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                        {[post.category, post.provinceName].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
