import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ContactForm from '@/app/components/ContactForm';
import { filterPublishedPosts, getPublishedBlogIndexPosts } from '@/app/lib/blog-posts';
import { SITE_DESCRIPTION, SITE_NAME, buildDescription, getAbsoluteUrl } from '@/app/lib/site-config';

type SearchParams = {
  category?: string;
  province?: string;
};

const allLabel = 'Tất Cả';

export const dynamic = 'force-dynamic';

function getCategoryHref(category: string, selectedProvince: string) {
  const params = new URLSearchParams();

  if (category !== allLabel) {
    params.set('category', category);
  }

  if (selectedProvince !== allLabel) {
    params.set('province', selectedProvince);
  }

  const query = params.toString();
  return query ? `/blog?${query}` : '/blog';
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { category = '', province = '' } = await searchParams;
  const hasFilter = Boolean(category || province);
  const filterLabel = [category, province].filter(Boolean).join(' - ');
  const title = hasFilter
    ? `${filterLabel} | Blog địa điểm`
    : `Blog địa điểm, review và cẩm nang du lịch`;
  const description = hasFilter
    ? buildDescription(
        `Khám phá các bài viết ${category || 'địa điểm'} ${province ? `tại ${province}` : ''} trên ${SITE_NAME}.`,
        '',
        SITE_DESCRIPTION
      )
    : SITE_DESCRIPTION;

  return {
    title,
    description,
    alternates: {
      canonical: '/blog',
    },
    robots: hasFilter
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      type: 'website',
      url: getAbsoluteUrl('/blog'),
      title,
      description,
      siteName: SITE_NAME,
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function Blog({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category = allLabel, province = allLabel } = await searchParams;
  const allPosts = await getPublishedBlogIndexPosts();
  const posts = filterPublishedPosts(allPosts, category, province);

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

      <div className="mx-auto max-w-screen-2xl px-8 pb-16 pt-32">
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 space-y-12 lg:col-span-9">
            <section className="border-b border-slate-100 py-12 text-left">
              <h1 className="mb-4 text-6xl font-black uppercase leading-none tracking-tighter text-[#00173a]">Content Hub</h1>
              <p className="text-xl font-medium text-slate-500">Khám phá những câu chuyện, review và danh sách tuyển chọn theo từng tỉnh thành.</p>
            </section>

            <section className="sticky top-20 z-40 space-y-4 border-b border-slate-50 bg-white/90 py-4 backdrop-blur-md">
              <div className="flex flex-wrap gap-3">
                {categories.map((item) => (
                  <Link
                    key={item.name}
                    href={getCategoryHref(item.name, province)}
                    className={`rounded-full px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] shadow-sm transition-all duration-300 ${category === item.name ? 'bg-[#00173a] text-white' : 'bg-slate-50 text-slate-400 hover:bg-[#bb0012] hover:text-white'}`}
                  >
                    {item.name} {item.count > 0 && `(${item.count})`}
                  </Link>
                ))}
              </div>

              <form className="flex flex-wrap items-center gap-4" method="get">
                {category !== allLabel && <input type="hidden" name="category" value={category} />}
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Lọc Theo Tỉnh</span>
                <select
                  name="province"
                  defaultValue={province}
                  className="min-w-[220px] rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#00173a] outline-none"
                >
                  <option value={allLabel}>{allLabel}</option>
                  {provinces.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-full bg-[#00173a] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                >
                  Áp dụng
                </button>
                {(category !== allLabel || province !== allLabel) && (
                  <Link
                    href="/blog"
                    className="rounded-full bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500"
                  >
                    Xóa lọc
                  </Link>
                )}
              </form>
            </section>

            {posts.length > 0 ? (
              <section className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block cursor-pointer">
                    <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-xl shadow-slate-100">
                      {post.image ? (
                        <img alt={post.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src={post.image} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-200">
                          <FileText className="h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute left-6 top-6 flex flex-wrap gap-2">
                        {post.category && <span className="rounded-full bg-[#bb0012] px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">{post.category}</span>}
                        {post.provinceName && <span className="rounded-full bg-white/95 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#00173a] shadow-lg">{post.provinceName}</span>}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#bb0012]">
                        <span className="text-slate-400">{post.author || SITE_NAME}</span>
                      </div>
                      <h2 className="mb-3 line-clamp-2 text-2xl font-black italic leading-tight text-[#00173a] transition-colors group-hover:text-[#bb0012]">
                        {post.title}
                      </h2>
                      <p className="mb-6 line-clamp-3 text-sm font-medium leading-relaxed text-slate-500">{post.excerpt}</p>
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all group-hover:gap-4">
                        Đọc tiếp <ChevronRight className="h-4 w-4 text-[#bb0012]" />
                      </span>
                    </div>
                  </Link>
                ))}
              </section>
            ) : (
              <div className="py-40 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                  <FileText className="h-10 w-10 text-slate-100" />
                </div>
                <h3 className="text-2xl font-black uppercase text-[#00173a]">Chưa Có Bài Viết</h3>
                <p className="mt-2 font-bold text-slate-400">Hiện chưa có bài viết phù hợp với bộ lọc bạn đang chọn.</p>
              </div>
            )}
          </div>

          <aside className="col-span-12 space-y-12 lg:col-span-3">
            <section className="rounded-[3rem] bg-[#00173a] p-10 text-white shadow-2xl shadow-[#00173a]/20">
              <h2 className="mb-2 text-xl font-black uppercase tracking-tighter">Bản Tin</h2>
              <p className="mb-8 text-xs font-bold uppercase tracking-widest text-white/50">Nhận những địa điểm hot nhất qua email</p>
              <ContactForm buttonText="Tham Gia Ngay" />
            </section>

            <section>
              <h2 className="mb-8 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#00173a]">
                <span className="h-1 w-10 rounded-full bg-[#bb0012]" />
                Xu Hướng
              </h2>
              <div className="space-y-8">
                {allPosts.slice(0, 5).map((post, index) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-5">
                    <span className="text-3xl font-black text-slate-100 transition-colors group-hover:text-[#bb0012]">{(index + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <h3 className="mb-2 text-sm font-black italic leading-tight text-[#00173a] group-hover:underline">{post.title}</h3>
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
