'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  showNewsTicker?: boolean;
  activeLink?: 'home' | 'blog' | 'du-lich' | 'phong-cach' | 'dich-vu';
}

export default function Header({ showNewsTicker = false, activeLink }: HeaderProps) {
  const [categories, setCategories] = useState<{name: string, slug: string}[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{title: string; slug: string; category: string}[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-trigger')) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Standard fallback
  const fallbackCategories = [
    { name: 'Nhà hàng & Ẩm thực', slug: 'Nhà hàng' },
    { name: 'Spa & Làm đẹp', slug: 'Spa' },
    { name: 'Khách sạn', slug: 'Khách sạn' },
    { name: 'Du lịch', slug: 'Du Lịch' },
    { name: 'Cà phê', slug: 'Cà phê' },
    { name: 'Mua sắm', slug: 'Mua sắm' },
  ];
  
  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  // Vietnamese accent stripper for fuzzy search
  function stripAccents(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch('/api/blog');
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const normalized = stripAccents(searchQuery);
        const filtered = data
          .filter((p: { title?: string; excerpt?: string; category?: string }) => {
            const titleNoAccent = stripAccents(p.title || '');
            const excerptNoAccent = stripAccents(p.excerpt || '');
            const categoryNoAccent = stripAccents(p.category || '');
            return titleNoAccent.includes(normalized) ||
              excerptNoAccent.includes(normalized) ||
              categoryNoAccent.includes(normalized);
          })
          .slice(0, 8)
          .map((p: { title: string; slug: string; category: string }) => ({
            title: p.title,
            slug: p.slug,
            category: p.category || '',
          }));
        setSearchResults(filtered);
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-trigger') && !target.closest('.search-input-field')) {
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 overflow-x-clip bg-white/80 shadow-sm backdrop-blur-xl">
      {showNewsTicker ? (
        <div className="overflow-hidden whitespace-nowrap bg-[#00173a] px-4 py-2 text-white sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] sm:gap-4 sm:text-xs">
            <span className="bg-[#bb0012] px-2 py-0.5 rounded-sm">Nổi Bật</span>
            <p className="animate-pulse">Khám Phá Các Bài Review Địa Điểm, Du Lịch Và Xếp Hạng Mới Nhất Mỗi Ngày Tại Địa Điểm Hot.</p>
          </div>
        </div>
      ) : null}
      <nav className="mx-auto flex h-16 w-full max-w-screen-2xl min-w-0 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex h-8 shrink-0 items-center sm:h-10">
          <Image src="/logo.png" alt="Thành Đạt" width={120} height={32} className="h-full w-auto object-contain" priority />
        </Link>
        <div className="hidden lg:flex items-center space-x-6 text-sm font-semibold">
          <Link
            className={`transition-colors duration-200 pb-1 ${activeLink === 'home' ? 'text-[#bb0012] border-b-2 border-[#bb0012]' : 'text-slate-600 hover:text-[#bb0012]'}`}
            href="/"
          >
            Khám Phá
          </Link>
          <div className="relative group">
            <span className="text-slate-600 hover:text-[#bb0012] transition-colors duration-200 cursor-pointer">Danh Mục</span>
            <div className="absolute top-full left-0 mt-2 w-[720px] bg-white shadow-2xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50/50">
                <p className="text-[10px] font-black text-[#00173a] uppercase tracking-[0.2em] px-3 pb-3 border-b border-slate-200 mb-2">Khám phá theo ngành</p>
                <div className="grid grid-cols-3 gap-x-3 gap-y-1">
                  {displayCategories.map((cat, idx) => (
                    <Link 
                      key={idx} 
                      href={`/blog?category=${cat.slug || cat.name}`} 
                      className="group/item flex items-center px-3 py-2.5 text-sm text-slate-600 hover:text-[#bb0012] hover:bg-white rounded-lg transition-all duration-200 border-l-0 hover:border-l-4 border-[#bb0012] hover:pl-5 font-semibold"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="bg-[#00173a] p-3 text-center">
                <Link href="/blog" className="text-[10px] font-bold text-white uppercase tracking-widest hover:text-[#bb0012] transition-colors">
                  Xem tất cả bài viết →
                </Link>
              </div>
            </div>
          </div>
          <Link
            className={`transition-colors duration-200 pb-1 ${activeLink === 'blog' ? 'text-[#bb0012] border-b-2 border-[#bb0012]' : 'text-slate-600 hover:text-[#bb0012]'}`}
            href="/blog"
          >
            Blog
          </Link>
          <Link
            className={`transition-colors duration-200 pb-1 ${activeLink === 'du-lich' ? 'text-[#bb0012] border-b-2 border-[#bb0012]' : 'text-slate-600 hover:text-[#bb0012]'}`}
            href="/du-lich"
          >
            Du Lịch
          </Link>
          <Link
            className={`transition-colors duration-200 pb-1 ${activeLink === 'phong-cach' ? 'text-[#bb0012] border-b-2 border-[#bb0012]' : 'text-slate-600 hover:text-[#bb0012]'}`}
            href="/phong-cach"
          >
            Xếp Hạng
          </Link>
          <Link
            className={`transition-colors duration-200 pb-1 ${activeLink === 'dich-vu' as any ? 'text-[#bb0012] border-b-2 border-[#bb0012]' : 'text-slate-600 hover:text-[#bb0012]'}`}
            href="/dich-vu"
          >
            Dịch Vụ
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="relative search-trigger">
            <button
              suppressHydrationWarning={true}
              onClick={() => setShowSearch(!showSearch)}
              className="shrink-0 text-slate-600 hover:text-slate-900"
            >
              <Search className="w-5 h-5" />
            </button>
            {showSearch && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl sm:w-80">
                <div className="p-3 border-b border-slate-100">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm bài viết..."
                    className="search-input-field w-full px-4 py-2.5 text-sm bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-[#bb0012]/20 border border-slate-100 font-medium text-[#00173a] placeholder:text-slate-400"
                  />
                </div>
                {searching && (
                  <div className="py-6 px-4 text-center text-xs text-slate-400">Đang tìm...</div>
                )}
                {!searching && searchQuery && searchResults.length === 0 && (
                  <div className="py-6 px-4 text-center">
                    <p className="text-sm text-slate-500">Không tìm thấy kết quả</p>
                    <p className="text-xs text-slate-400 mt-1">Thử từ khóa khác</p>
                  </div>
                )}
                {!searching && searchResults.length > 0 && (
                  <div className="max-h-80 overflow-y-auto py-2">
                    {searchResults.map(result => (
                      <a
                        key={result.slug}
                        href={`/blog/${result.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <Search className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#00173a] line-clamp-1">{result.title}</p>
                          <p className="text-[10px] text-[#bb0012] font-bold uppercase tracking-wider mt-0.5">{result.category}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                {!searching && !searchQuery && (
                  <div className="py-6 px-4 text-center text-xs text-slate-400">
                    Gõ từ khóa để tìm bài viết
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="relative notification-trigger">
            <button
              suppressHydrationWarning={true}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative shrink-0 text-slate-600 hover:text-slate-900"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#bb0012] rounded-full"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl sm:w-80">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-black uppercase tracking-widest text-[#00173a]">Thông Báo</p>
                </div>
                <div className="py-10 px-4 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-3 text-slate-200" />
                  <p className="text-sm font-medium text-slate-500">Bạn chưa có thông báo nào</p>
                </div>
              </div>
            )}
          </div>
          <Link href="/dang-nhap" className="whitespace-nowrap rounded-full bg-[#bb0012] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:opacity-90 active:scale-95 sm:px-5 sm:text-xs">
            Đăng Nhập
          </Link>
        </div>
      </nav>
    </header>
  );
}
