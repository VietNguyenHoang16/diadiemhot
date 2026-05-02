'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full bg-white/10 border-none rounded p-3 text-sm text-white placeholder:text-white/40 focus:ring-2 focus:ring-white outline-none"
        placeholder="email@cuaban.com"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-white text-[#bb0012] font-black text-sm uppercase tracking-widest py-3 rounded hover:bg-white/90 transition-colors disabled:opacity-60"
      >
        {status === 'loading' ? 'Đang gửi...' : status === 'success' ? '✓ Đã đăng ký!' : status === 'error' ? 'Lỗi, thử lại' : 'Đăng Ký Ngay'}
      </button>
    </form>
  );
}
