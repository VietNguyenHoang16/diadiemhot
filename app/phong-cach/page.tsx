'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Trophy } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { RANKING_CATEGORY } from '@/app/lib/ranking-posts';

type BlogPost = {
  id: string;
  title: string;
  excerpt?: string;
  image?: string;
  category?: string;
  province?: string;
  slug: string;
  author?: string;
  createdAt: string;
};

const FALLBACK_POST_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="55%" stop-color="#00173a" />
      <stop offset="100%" stop-color="#bb0012" />
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)" />
  <circle cx="950" cy="170" r="170" fill="rgba(255,255,255,0.09)" />
  <circle cx="290" cy="610" r="210" fill="rgba(255,255,255,0.06)" />
  <rect x="88" y="90" width="170" height="20" rx="10" fill="rgba(255,255,255,0.24)" />
  <rect x="88" y="140" width="270" height="22" rx="11" fill="#bb0012" />
  <text x="88" y="320" fill="#ffffff" font-family="Arial, sans-serif" font-size="118" font-weight="800">XEP HANG</text>
  <text x="88" y="410" fill="rgba(255,255,255,0.76)" font-family="Arial, sans-serif" font-size="36" font-weight="700">DIA DIEM TOT</text>
  <text x="88" y="520" fill="rgba(255,255,255,0.88)" font-family="Arial, sans-serif" font-size="42" font-weight="700">Tong hop cac bai viet xep hang noi bat</text>
</svg>
`)}`;

function getPostImage(image?: string) {
  const trimmedImage = image?.trim();
  return trimmedImage ? trimmedImage : FALLBACK_POST_IMAGE;
}

export default function PhongCachPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankingPosts() {
      try {
        const query = new URLSearchParams({ category: RANKING_CATEGORY }).toString();
        const res = await fetch(`/api/blog?${query}`);
        if (!res.ok) return;

        const data = (await res.json()) as BlogPost[];
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch ranking posts:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchRankingPosts();
  }, []);

  const heroPost = posts[0] || null;
  const spotlightPosts = posts.slice(1, 5);
  const archivePosts = posts.slice(5);
  const sidebarPosts = posts.slice(0, 5);
  const provinceHighlights = Object.entries(
    posts.reduce<Record<string, number>>((accumulator, post) => {
      if (post.province) {
        accumulator[post.province] = (accumulator[post.province] ?? 0) + 1;
      }
      return accumulator;
    }, {})
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-white">
      <Header showNewsTicker={true} activeLink="phong-cach" />

      <div className="mx-auto max-w-screen-2xl overflow-x-clip px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          <div className="col-span-12 min-w-0 space-y-12 lg:col-span-8">
            <section className="border-b border-slate-100 pb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#bb0012]">Phong Cach Editorial</p>
              <h1 className="mt-4 text-5xl font-black uppercase tracking-tighter text-[#00173a]">Xếp Hạng</h1>
              <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-slate-500">
                Những bài viết tuyển chọn theo format xếp hạng, danh sách top và góc nhìn biên tập dành riêng cho trang này.
              </p>
            </section>

            {loading ? (
              <section className="space-y-6">
                <div className="aspect-[16/9] animate-pulse rounded-[2.5rem] bg-slate-100" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="overflow-hidden rounded-[2rem] border border-slate-100">
                      <div className="aspect-[16/10] animate-pulse bg-slate-100" />
                      <div className="space-y-4 p-6">
                        <div className="h-4 w-24 rounded bg-slate-100" />
                        <div className="h-8 w-5/6 rounded bg-slate-100" />
                        <div className="h-4 w-full rounded bg-slate-100" />
                        <div className="h-4 w-2/3 rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : heroPost ? (
              <>
                <section>
                  <Link
                    href={`/blog/${heroPost.slug}`}
                    className="group relative block overflow-hidden rounded-[2.75rem] bg-[#00173a] shadow-2xl shadow-[#00173a]/10"
                  >
                    <img
                      alt={heroPost.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={getPostImage(heroPost.image)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00173a] via-[#00173a]/85 to-[#00173a]/30" />
                    <div className="relative flex min-h-[460px] flex-col justify-end p-6 sm:min-h-[520px] md:p-12">
                      <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-white/70">
                        <span className="rounded-full bg-[#bb0012] px-4 py-2 text-white">{RANKING_CATEGORY}</span>
                        {heroPost.province ? (
                          <span className="rounded-full bg-white/10 px-4 py-2">{heroPost.province}</span>
                        ) : null}
                      </div>
                      <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-tighter text-white md:text-5xl">
                        {heroPost.title}
                      </h2>
                      <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/78">{heroPost.excerpt}</p>
                      <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em] text-white">
                        <span>Đọc bảng xếp hạng</span>
                        <ArrowRight className="h-4 w-4 text-[#bb0012] transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </section>

                {spotlightPosts.length > 0 ? (
                  <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {spotlightPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm transition-colors hover:border-[#bb0012]/30"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                          <img
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            src={getPostImage(post.image)}
                          />
                          <div className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#bb0012] shadow-sm">
                            {RANKING_CATEGORY}
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="mb-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                            {post.province ? <span>{post.province}</span> : null}
                          </div>
                          <h3 className="line-clamp-3 text-2xl font-black leading-tight text-[#00173a] transition-colors group-hover:text-[#bb0012]">
                            {post.title}
                          </h3>
                          <p className="mt-4 line-clamp-3 text-sm font-medium leading-relaxed text-slate-500">{post.excerpt}</p>
                          <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#00173a]">
                            <span>Xem chi tiết</span>
                            <ArrowRight className="h-4 w-4 text-[#bb0012] transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </section>
                ) : null}

                <section className="space-y-5">
                  <div className="flex items-center gap-4">
                    <span className="h-1 w-10 rounded-full bg-[#bb0012]" />
                    <h2 className="text-xl font-black uppercase tracking-[0.24em] text-[#00173a]">Kho bài xếp hạng</h2>
                  </div>

                  {archivePosts.length > 0 ? (
                    <div className="space-y-4">
                      {archivePosts.map((post, index) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white transition-colors hover:border-[#bb0012]/30 sm:grid sm:grid-cols-[220px_1fr]"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 sm:aspect-auto sm:h-full">
                            <img
                              alt={post.title}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                              src={getPostImage(post.image)}
                            />
                            <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#bb0012] shadow-sm">
                              {(index + 6).toString().padStart(2, '0')}
                            </div>
                          </div>
                          <div className="p-5 sm:p-6">
                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                              {post.province ? <span>{post.province}</span> : null}
                            </div>
                            <h3 className="mt-2 text-xl font-black leading-tight text-[#00173a] transition-colors group-hover:text-[#bb0012]">
                              {post.title}
                            </h3>
                            <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">{post.excerpt}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-8">
                      <p className="text-sm font-bold text-slate-500">
                        Hiện chưa có thêm bài nào ngoài bài nổi bật ở trên.
                      </p>
                    </div>
                  )}
                </section>
              </>
            ) : (
              <section className="rounded-[2.5rem] border border-dashed border-slate-200 bg-slate-50 px-8 py-20 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                  <Trophy className="h-9 w-9 text-[#bb0012]" />
                </div>
                <h2 className="mt-6 text-3xl font-black uppercase tracking-tighter text-[#00173a]">Chưa có bài xếp hạng</h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
                  Trang này chỉ hiển thị bài đã xuất bản với category <strong>{RANKING_CATEGORY}</strong>. Hãy publish bài đúng category từ trang admin để nội dung xuất hiện ở đây.
                </p>
              </section>
            )}
          </div>

          <aside className="col-span-12 min-w-0 space-y-8 lg:col-span-4">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                <Sparkles className="h-4 w-4 text-[#bb0012]" />
                <span>Mẹo</span>
              </div>
              <h2 className="mt-4 max-w-xs text-lg font-black uppercase leading-snug tracking-tight text-[#00173a]">
                Website đẹp giúp doanh nghiệp tạo tin tưởng nhanh hơn
              </h2>
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                {[
                  'Giao diện chỉn chu giúp khách hàng đánh giá thương hiệu chuyên nghiệp hơn ngay từ lần xem đầu tiên.',
                  'Bài review, xếp hạng và nội dung nổi bật là cách tốt để đưa doanh nghiệp đến gần người đang có nhu cầu.',
                ].map((item, index) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#bb0012]" />
                    <p className="text-sm font-medium leading-relaxed text-slate-600">
                      <span className="mr-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#bb0012]">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[1.5rem] bg-slate-50 px-4 py-3 text-sm font-semibold leading-relaxed text-slate-600">
                Muốn doanh nghiệp xuất hiện nổi bật hơn trên online? Đây là lúc phù hợp để đầu tư nội dung và kênh hiển thị bài bản.
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-[10px] font-black uppercase tracking-[0.28em] text-[#00173a]">Mới cập nhật</h2>
              <div className="mt-6 space-y-5">
                {sidebarPosts.length > 0 ? (
                  sidebarPosts.map((post, index) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group flex items-center gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                        <img
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          src={getPostImage(post.image)}
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2 py-1 text-[11px] font-black leading-none text-[#bb0012] shadow-sm">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-black leading-tight text-[#00173a] transition-colors group-hover:text-[#bb0012]">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          {[post.category, post.province].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-400">
                    Chưa có bài nào để hiển thị.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-[10px] font-black uppercase tracking-[0.28em] text-[#00173a]">Địa phương nổi bật</h2>
              <div className="mt-6 space-y-4">
                {provinceHighlights.length > 0 ? (
                  provinceHighlights.map(([province, count]) => (
                    <div key={province} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                      <div>
                        <p className="text-sm font-black text-[#00173a]">{province}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">Đang có bài xếp hạng đáng chú ý trong chuyên mục này.</p>
                      </div>
                      <span className="rounded-full bg-[#bb0012] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                        {count} bài
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold leading-relaxed text-slate-500">
                    Khi bài viết có gắn tỉnh hoặc thành phố, khu vực nổi bật sẽ hiện ở đây để bạn đọc nhanh theo địa phương.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
