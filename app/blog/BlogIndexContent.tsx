'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import { SITE_NAME } from '@/app/lib/site-config';

type BlogIndexPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  category?: string | null;
  provinceName?: string | null;
  author?: string | null;
};

type CategoryItem = {
  name: string;
  count: number;
};

type BlogIndexContentProps = {
  allLabel: string;
  allPosts: BlogIndexPost[];
  categories: CategoryItem[];
  provinces: string[];
};

function filterPosts(posts: BlogIndexPost[], allLabel: string, category?: string, province?: string) {
  return posts.filter((post) => {
    const categoryMatch = !category || category === allLabel || post.category === category;
    const provinceMatch = !province || province === allLabel || post.provinceName === province;
    return categoryMatch && provinceMatch;
  });
}

function getCategoryHref(category: string, selectedProvince: string, allLabel: string) {
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

export default function BlogIndexContent({
  allLabel,
  allPosts,
  categories,
  provinces,
}: BlogIndexContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category')?.trim() || allLabel;
  const province = searchParams.get('province')?.trim() || allLabel;
  const [selectedProvince, setSelectedProvince] = useState(province);

  useEffect(() => {
    setSelectedProvince(province);
  }, [province]);

  const posts = useMemo(
    () => filterPosts(allPosts, allLabel, category, province),
    [allLabel, allPosts, category, province]
  );

  function handleProvinceSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();

    if (category !== allLabel) {
      params.set('category', category);
    }

    if (selectedProvince !== allLabel) {
      params.set('province', selectedProvince);
    }

    const query = params.toString();
    router.push(query ? `/blog?${query}` : '/blog');
  }

  return (
    <div className="space-y-12">
      <section className="border-b border-slate-100 py-12 text-left">
        <h1 className="mb-4 text-4xl font-black uppercase leading-none tracking-tighter text-[#00173a] sm:text-5xl lg:text-6xl">
          Content Hub
        </h1>
        <p className="text-xl font-medium text-slate-500">
          Khám phá những câu chuyện, review và danh sách tuyển chọn theo từng tỉnh thành.
        </p>
      </section>

      <section className="sticky top-16 z-40 space-y-4 border-b border-slate-50 bg-white/90 py-4 backdrop-blur-md sm:top-20">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {categories.map((item) => (
            <Link
              key={item.name}
              href={getCategoryHref(item.name, province, allLabel)}
              className={`rounded-full px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] shadow-sm transition-all duration-300 ${
                category === item.name
                  ? 'bg-[#00173a] text-white'
                  : 'bg-slate-50 text-slate-400 hover:bg-[#bb0012] hover:text-white'
              }`}
            >
              {item.name} {item.count > 0 && `(${item.count})`}
            </Link>
          ))}
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          onSubmit={handleProvinceSubmit}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Lọc Theo Tỉnh
          </span>
          <select
            value={selectedProvince}
            onChange={(event) => setSelectedProvince(event.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#00173a] outline-none sm:w-auto sm:min-w-[220px]"
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
            className="w-full rounded-full bg-[#00173a] px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white sm:w-auto"
          >
            Áp dụng
          </button>
          {(category !== allLabel || province !== allLabel) && (
            <Link
              href="/blog"
              className="w-full rounded-full bg-slate-50 px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 sm:w-auto"
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
                  <img
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={post.image}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-200">
                    <FileText className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute left-6 top-6 flex flex-wrap gap-2">
                  {post.category ? (
                    <span className="rounded-full bg-[#bb0012] px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                      {post.category}
                    </span>
                  ) : null}
                  {post.provinceName ? (
                    <span className="rounded-full bg-white/95 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#00173a] shadow-lg">
                      {post.provinceName}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#bb0012]">
                  <span className="text-slate-400">{post.author || SITE_NAME}</span>
                </div>
                <h2 className="mb-3 line-clamp-2 text-2xl font-black italic leading-tight text-[#00173a] transition-colors group-hover:text-[#bb0012]">
                  {post.title}
                </h2>
                <p className="mb-6 line-clamp-3 text-sm font-medium leading-relaxed text-slate-500">
                  {post.excerpt}
                </p>
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
          <p className="mt-2 font-bold text-slate-400">
            Hiện chưa có bài viết phù hợp với bộ lọc bạn đang chọn.
          </p>
        </div>
      )}
    </div>
  );
}
