'use client';

import { useEffect, useState } from 'react';

const sections = [
  { id: 'section-01', label: '01. Nguồn Gốc' },
  { id: 'section-02', label: '02. Thưởng Thức' },
  { id: 'section-03', label: '03. Địa Chỉ Gợi Ý' },
  { id: 'section-04', label: '04. Mẹo Hay' },
];

export default function ArticleSidebar() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    function handleScroll() {
      const article = document.getElementById('article-body');
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const articleTop = window.scrollY + rect.top;
      const articleHeight = article.offsetHeight;
      const scrolled = window.scrollY - articleTop;
      const pct = Math.max(0, Math.min(100, (scrolled / (articleHeight - window.innerHeight)) * 100));
      setProgress(pct);

      // Find active section
      let current = '';
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= 150) current = section.id;
        }
      }
      setActiveSection(current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="sticky top-24 flex flex-col items-center space-y-6 pt-2 pr-6">
      {/* Progress Bar */}
      <div className="relative w-1 h-48 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full bg-[#bb0012] rounded-full transition-all duration-150"
          style={{ height: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] font-black text-slate-400 tabular-nums">{Math.round(progress)}%</span>

      {/* Mini Table of Contents */}
      <div className="w-px h-6 bg-slate-200" />
      <nav className="space-y-3" aria-label="Mục lục bài viết">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`block text-[10px] font-bold uppercase tracking-widest transition-colors leading-tight ${
              activeSection === s.id
                ? 'text-[#bb0012]'
                : 'text-slate-300 hover:text-slate-600'
            }`}
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {s.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
