import Link from 'next/link';
import { connection } from 'next/server';
import { ChevronRight, Star, MapPin, Utensils, Plane, Smartphone, Shirt } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ContactForm from '@/app/components/ContactForm';
import { hasDatabaseUrl } from '@/app/lib/public-db';
import { prisma } from '@/app/lib/db';
import { isRankingCategory, looksLikeRankingPostTitle } from '@/app/lib/ranking-posts';
import { toAbsoluteImageUrl } from '@/app/lib/site-config';

// Revalidate every hour — homepage auto-refreshes with new content

const FALLBACK_HOME_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#dfe3e8" />
      <stop offset="45%" stop-color="#00173a" />
      <stop offset="100%" stop-color="#bb0012" />
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)" />
  <circle cx="960" cy="170" r="180" fill="rgba(255,255,255,0.10)" />
  <circle cx="250" cy="650" r="220" fill="rgba(255,255,255,0.08)" />
  <rect x="90" y="110" width="220" height="28" rx="14" fill="rgba(255,255,255,0.18)" />
  <rect x="90" y="170" width="290" height="24" rx="12" fill="#bb0012" />
  <text x="90" y="350" fill="#ffffff" font-family="Arial, sans-serif" font-size="110" font-weight="800">DIA DIEM</text>
  <text x="90" y="445" fill="#ffffff" font-family="Arial, sans-serif" font-size="110" font-weight="800">HOT</text>
  <text x="90" y="555" fill="rgba(255,255,255,0.82)" font-family="Arial, sans-serif" font-size="38" font-weight="700">Bai viet noi bat va review moi nhat</text>
</svg>
`)}`;

function getHomepageImage(image?: string | null) {
  const trimmedImage = image?.trim();
  return trimmedImage ? toAbsoluteImageUrl(trimmedImage) : FALLBACK_HOME_IMAGE;
}

// ---- Deterministic daily shuffle using date seed ----
function dailyShuffle<T>(arr: T[]): T[] {
  const seed = new Date().toISOString().slice(0, 10); // "2026-04-17"
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    const j = hash % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function getHomepageData() {
  const emptyData = {
    heroPost: null,
    heroSidePosts: [],
    rankingPosts: [],
    newsPosts: [],
    trendingPosts: [],
    guidePosts: [],
    archivePosts: [],
    latestReviews: [],
    tags: [],
    categories: [],
    totalPosts: 0,
    loadFailed: true,
  };

  if (!hasDatabaseUrl()) {
    return emptyData;
  }

  const allPostsQuery = prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    include: {
      tags: { include: { tag: true } },
      province: { select: { name: true } },
    },
  });
  const latestReviewsQuery = prisma.review.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: { business: { select: { name: true, logo: true } } },
  });
  const tagsQuery = prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: 'asc' },
  });
  const categoriesQuery = prisma.category.findMany({
    orderBy: { order: 'asc' },
    take: 8,
  });

  let allPosts: Awaited<typeof allPostsQuery> = [];
  let latestReviews: Awaited<typeof latestReviewsQuery> = [];
  let tags: Awaited<typeof tagsQuery> = [];
  let categories: Awaited<typeof categoriesQuery> = [];

  try {
    [allPosts, latestReviews, tags, categories] = await Promise.all([
      allPostsQuery,
      latestReviewsQuery,
      tagsQuery,
      categoriesQuery,
    ]);
  } catch (error) {
    console.error('[homepage] Failed to load public data', error);
    return emptyData;
  }

  // Split posts into sections using deterministic shuffle for daily variety
  const postsWithImage = allPosts.filter(p => p.image);
  const shuffledWithImage = dailyShuffle(postsWithImage);

  const heroPost = shuffledWithImage[0] || allPosts[0] || null;
  const heroSidePosts = (shuffledWithImage.length > 1 ? shuffledWithImage.slice(1, 5) : allPosts.slice(1, 5));

  const usedIds = new Set([heroPost?.id, ...heroSidePosts.map(p => p.id)].filter(Boolean));

  const rankingPosts = dailyShuffle(
    allPosts.filter(
      (p) => !usedIds.has(p.id) && (isRankingCategory(p.category) || looksLikeRankingPostTitle(p.title))
    )
  ).slice(0, 5);
  rankingPosts.forEach(p => usedIds.add(p.id));

  const newsPosts = allPosts.filter(p => !usedIds.has(p.id)).slice(0, 6);
  newsPosts.forEach(p => usedIds.add(p.id));

  const trendingPosts = dailyShuffle(allPosts.filter(p => !usedIds.has(p.id))).slice(0, 4);
  trendingPosts.forEach(p => usedIds.add(p.id));

  const guidePosts = dailyShuffle(allPosts.filter(p => !usedIds.has(p.id) && (p.category === 'Du lich' || p.title?.toLowerCase().includes('hướng dẫn')))).slice(0, 3);

  const guidePostIds = new Set(guidePosts.map((post) => post.id));
  const archivePosts = allPosts.filter((post) => !usedIds.has(post.id) && !guidePostIds.has(post.id));

  return {
    heroPost,
    heroSidePosts,
    rankingPosts,
    newsPosts,
    trendingPosts,
    guidePosts,
    archivePosts,
    latestReviews,
    tags,
    categories,
    totalPosts: allPosts.length,
    loadFailed: false,
  };
}

// ---- Helper: estimate read time ----
function readTime(content?: string | null): string {
  if (!content) return '3 min';
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return `${Math.max(2, Math.ceil(words / 200))} min`;
}

export default async function Home() {
  await connection();

  const data = await getHomepageData();
  const { heroPost, heroSidePosts, rankingPosts, newsPosts, trendingPosts, guidePosts, archivePosts, latestReviews, tags, categories, totalPosts, loadFailed } = data;

  return (
    <main className="min-h-screen bg-white">
      <Header showNewsTicker={true} activeLink="home" />

      <div className="max-w-screen-2xl mx-auto pt-28 px-8 pb-16">
        {loadFailed && (
          <section className="mb-8 rounded-lg border border-[#bb0012]/15 bg-[#fff7f7] px-5 py-4 text-sm font-medium text-slate-600">
            Trang táº¡m thá»i chÆ°a táº£i Ä‘Æ°á»£c dá»¯ liá»‡u má»›i nháº¥t. Vui lÃ²ng kiá»ƒm tra káº¿t ná»‘i cÆ¡ sá»Ÿ dá»¯ liá»‡u trÃªn mÃ´i trÆ°á»ng deploy vÃ  thá»­ táº£i láº¡i.
          </section>
        )}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Side Content (Main Feed) */}
          <div className="col-span-12 lg:col-span-9 space-y-12">

            {/* 1. Hero Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Featured Article */}
              {heroPost ? (
                <Link href={`/blog/${heroPost.slug}`} className="relative group overflow-hidden rounded-lg bg-[#dfe3e8] aspect-[4/5] md:aspect-auto h-full min-h-[400px] block">
                  <img
                    alt={heroPost.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={getHomepageImage(heroPost.image)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00173a]/90 to-transparent" />
                  <div className="absolute bottom-0 p-8">
                    <span className="inline-block bg-[#bb0012] px-3 py-1 text-xs font-bold text-white uppercase tracking-widest mb-4">
                      {heroPost.category || 'Nổi Bật'}
                    </span>
                    <h2 className="text-4xl font-black text-white leading-tight mb-4 tracking-tighter">
                      {heroPost.title}
                    </h2>
                    <p className="text-white/80 text-base max-w-lg mb-6 line-clamp-2">
                      {heroPost.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-white/60 text-xs font-black uppercase tracking-widest">
                      <span>By Địa Điểm Hot</span>
                      <span className="w-1 h-1 bg-[#bb0012] rounded-full" />
                      <span>{readTime(heroPost.content)}</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#00173a] to-[#002b61] min-h-[400px] flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-5xl mb-6">📝</p>
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Chưa Có Bài Viết</h2>
                    <p className="text-white/60 text-sm">Hãy tạo bài viết đầu tiên tại trang Admin</p>
                  </div>
                </div>
              )}

              {/* 4 Smaller Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {heroSidePosts.length > 0 ? heroSidePosts.map((post, i) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className={`group relative min-h-[240px] rounded-lg overflow-hidden flex flex-col justify-end transition-colors ${i === heroSidePosts.length - 1 ? 'border-2 border-[#bb0012]/10' : 'border border-slate-100 hover:border-[#bb0012]/20'} ${post.image ? 'bg-[#00173a]' : 'bg-white'}`}>
                    <img
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={getHomepageImage(post.image)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00173a]/90 via-[#00173a]/45 to-transparent" />
                    <div className="relative z-10 p-4">
                    <span className={`text-xs font-black uppercase tracking-widest mb-2 block ${post.image ? 'text-white/80' : 'text-[#bb0012]'}`}>
                      {post.category || 'Bài Viết'}
                    </span>
                    <h3 className={`text-base font-bold leading-snug transition-colors line-clamp-2 ${post.image ? 'text-white' : 'text-[#00173a] hover:text-[#bb0012]'}`}>
                      {post.title}
                    </h3>
                    <p className={`text-sm mt-2 line-clamp-2 ${post.image ? 'text-white/75' : 'text-slate-500'}`}>{post.excerpt}</p>
                    </div>
                  </Link>
                )) : (
                  <>
                    {[1,2,3,4].map(i => (
                      <div key={i} className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center min-h-[120px]">
                        <p className="text-sm text-slate-300 font-bold">Vị trí bài viết #{i+1}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </section>

            {/* 2. Ranking Posts */}
            {rankingPosts.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-8">
                  <h2 className="text-3xl font-black text-[#00173a] uppercase tracking-tighter">Top & Xếp Hạng</h2>
                  <Link href="/blog" className="text-sm font-bold text-[#bb0012] uppercase tracking-widest hover:underline">
                    Xem Tất Cả
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x scrollbar-thin">
                  {rankingPosts.map(post => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="min-w-[280px] snap-start group relative block">
                      <div className="aspect-[16/10] bg-slate-200 rounded overflow-hidden mb-3 relative">
                        {post.image ? (
                          <img alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" src={getHomepageImage(post.image)} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
                            <span className="text-4xl">🏆</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-[#00173a] text-white text-xs px-2 py-1 font-bold uppercase">{post.category || 'Ranking'}</div>
                      </div>
                      <h4 className="font-bold text-[#00173a] text-base leading-tight group-hover:text-[#bb0012] transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Latest News Feed */}
            {newsPosts.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-[#00173a] uppercase tracking-tighter mb-8 border-l-4 border-[#bb0012] pl-4">
                  Tin Mới Nhất
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {newsPosts.map((post, idx) => {
                    // Make the 2nd item large if we have enough posts
                    if (idx === 1 && newsPosts.length >= 4) {
                      return (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="md:row-span-2 bg-[#00173a] text-white p-6 relative overflow-hidden group block">
                          <img alt={post.title} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-1000" src={getHomepageImage(post.image)} />
                          <div className="relative z-10">
                            <span className="bg-[#bb0012] px-2 py-0.5 text-xs font-bold tracking-widest uppercase inline-block mb-6">
                              {post.category || 'Đặc Biệt'}
                            </span>
                            <h3 className="text-2xl font-black leading-tight mb-4">{post.title}</h3>
                            <p className="text-base text-white/70 mb-8 line-clamp-3">{post.excerpt}</p>
                            <span className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                              Đọc Thêm <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </Link>
                      );
                    }
                    return (
                      <Link key={post.id} href={`/blog/${post.slug}`} className={`group overflow-hidden ${idx === 2 ? 'bg-slate-100' : 'bg-white shadow-sm border border-slate-100 hover:border-[#bb0012]/20'} transition-colors block`}>
                        <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-lg bg-slate-200">
                          <img
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            src={getHomepageImage(post.image)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#00173a]/35 via-transparent to-transparent" />
                        </div>
                        {idx === 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4 text-[#bb0012] fill-current" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đánh Giá</span>
                          </div>
                        )}
                        <h3 className="text-xl font-black text-[#00173a] leading-tight mb-3 hover:text-[#bb0012] transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-base text-slate-600 mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="text-xs text-slate-400 font-bold uppercase">{post.category || 'Bài viết'}</div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 4. Community Reviews */}
            {latestReviews.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-[#00173a] uppercase tracking-tighter mb-8">Cộng Đồng Đánh Giá</h2>
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                  {latestReviews.map((review) => (
                    <div key={review.id} className="break-inside-avoid bg-white p-4 shadow-sm border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        {review.business?.logo ? (
                          <img alt="" src={review.business.logo} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#bb0012] text-white flex items-center justify-center text-xs font-bold">★</div>
                        )}
                        <span className="text-xs font-bold">{review.business?.name || 'Địa điểm'}</span>
                        <div className="flex ml-auto">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-4">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {archivePosts.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-[#00173a] uppercase tracking-tighter">Toàn Bộ Bài Viết</h2>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Trang chủ hiển thị toàn bộ {totalPosts.toLocaleString('vi-VN')} bài đã xuất bản, nên bạn có thể cuộn xuống để xem hết.
                    </p>
                  </div>
                  <Link href="/blog" className="text-sm font-bold text-[#bb0012] uppercase tracking-widest hover:underline">
                    Mở Blog
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {archivePosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm transition-colors hover:border-[#bb0012]/20"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                        <img
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          src={getHomepageImage(post.image)}
                        />
                        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#bb0012] shadow-sm">
                          {post.category || 'Bài viết'}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="line-clamp-2 text-xl font-black leading-tight text-[#00173a] transition-colors group-hover:text-[#bb0012]">
                          {post.title}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-sm font-medium leading-relaxed text-slate-500">
                          {post.excerpt}
                        </p>
                        <div className="mt-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          <span>{readTime(post.content)}</span>
                          {post.province?.name && (
                            <>
                              <span className="h-1 w-1 rounded-full bg-[#bb0012]" />
                              <span>{post.province.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="col-span-12 lg:col-span-3 space-y-12">

            {/* Trending */}
            {trendingPosts.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-[#00173a] uppercase tracking-tighter mb-6">Đang Hot</h2>
                <div className="space-y-6">
                  {trendingPosts.map((post, idx) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="flex gap-4 group cursor-pointer">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                        <img
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          src={getHomepageImage(post.image)}
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black text-[#bb0012] shadow-sm">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#00173a] group-hover:underline line-clamp-2">{post.title}</h4>
                        <p className="text-xs text-slate-500 uppercase font-bold mt-1">{post.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <section className="bg-slate-100 p-6 rounded-lg">
                <h2 className="text-base font-black text-[#00173a] uppercase tracking-widest mb-6">Khám Phá Theo Chủ Đề</h2>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 6).map((cat) => {
                    const icons: Record<string, typeof Utensils> = { 'Ẩm Thực': Utensils, 'Du Lịch': Plane, 'Công Nghệ': Smartphone, 'Phong Cách': Shirt };
                    const Icon = icons[cat.name] || MapPin;
                    return (
                      <Link key={cat.id} href={`/blog?category=${encodeURIComponent(cat.name)}`} className="bg-white p-3 flex flex-col items-center justify-center rounded hover:bg-[#bb0012] hover:text-white transition-colors group">
                        <Icon className="w-5 h-5 text-[#bb0012] group-hover:text-white mb-1" />
                        <span className="text-xs font-bold uppercase tracking-widest">{cat.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Guide Posts */}
            {guidePosts.length > 0 && (
              <section>
                <h2 className="text-base font-black text-[#00173a] uppercase tracking-widest mb-6">Hướng Dẫn Hay</h2>
                <ul className="space-y-3">
                  {guidePosts.map(post => (
                    <li key={post.id} className="flex items-center gap-3 border-b border-slate-200 pb-3">
                      <MapPin className="w-4 h-4 text-[#bb0012] shrink-0" />
                      <Link href={`/blog/${post.slug}`} className="text-sm font-bold text-[#00173a] hover:text-[#bb0012] line-clamp-1">
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Newsletter */}
            <section className="bg-[#bb0012] text-white p-8 rounded-lg">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Địa Điểm Hot Daily</h2>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                Nhận những đánh giá và tin tức được chọn lọc kỹ càng gửi đến hộp thư của bạn mỗi sáng.
              </p>
              <ContactForm />
            </section>

            {/* Tags Cloud */}
            {tags.length > 0 && (
              <section>
                <h2 className="text-base font-black text-[#00173a] uppercase tracking-widest mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 15).map(tag => (
                    <Link key={tag.id} href={`/blog?tag=${encodeURIComponent(tag.name)}`} className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600 hover:bg-[#bb0012] hover:text-white transition-colors">
                      #{tag.name}
                      {tag._count.posts > 0 && <span className="ml-1 text-slate-400">({tag._count.posts})</span>}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
