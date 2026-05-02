'use client';

import { useState } from 'react';

type ContactFormProps = {
  variant?: 'default' | 'footer';
  buttonText?: string;
  leadPackage?: string;
  leadDescription?: string;
  businessName?: string;
  contactName?: string;
};

export default function ContactForm({
  variant = 'default',
  buttonText = 'Đăng Ký Ngay',
  leadPackage,
  leadDescription,
  businessName,
  contactName,
}: ContactFormProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();

    if (!normalizedEmail && !normalizedPhone) {
      setMessage('Vui lòng nhập email hoặc số điện thoại.');
      return;
    }

    setMessage('');
    setStatus('loading');

    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          phone: normalizedPhone,
          businessName,
          contactName,
          package: leadPackage,
          description: leadDescription,
        }),
      });

      if (!res.ok) {
        throw new Error('Lead submit failed');
      }

      setStatus('success');
      setEmail('');
      setPhone('');
      setMessage('Chúng tôi đã nhận thông tin và sẽ liên hệ lại sớm.');
      setTimeout(() => setStatus('idle'), 3000);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setStatus('error');
      setMessage('Không gửi được thông tin. Vui lòng thử lại.');
      setTimeout(() => setStatus('idle'), 3000);
      setTimeout(() => setMessage(''), 3000);
    }
  }

  if (variant === 'footer') {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#bb0012]/40 placeholder:text-white/40"
          placeholder="Email của bạn"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#bb0012]/40 placeholder:text-white/40"
          placeholder="Số điện thoại"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-lg bg-[#bb0012] py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#a00010] disabled:opacity-60"
        >
          {status === 'loading' ? 'Đang gửi...' : status === 'success' ? '✓ Đã gửi!' : status === 'error' ? 'Lỗi, thử lại' : buttonText}
        </button>
        {message ? <p className="text-xs text-white/70" aria-live="polite">{message}</p> : null}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border-none bg-white/10 p-3 text-sm text-white outline-none focus:ring-2 focus:ring-white placeholder:text-white/40"
        placeholder="email@cuaban.com"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded border-none bg-white/10 p-3 text-sm text-white outline-none focus:ring-2 focus:ring-white placeholder:text-white/40"
        placeholder="Số điện thoại (tùy chọn)"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded bg-white py-3 text-sm font-black uppercase tracking-widest text-[#bb0012] transition-colors hover:bg-white/90 disabled:opacity-60"
      >
        {status === 'loading' ? 'Đang gửi...' : status === 'success' ? '✓ Đã đăng ký!' : status === 'error' ? 'Lỗi, thử lại' : buttonText}
      </button>
      {message ? <p className="text-xs text-white/70" aria-live="polite">{message}</p> : null}
    </form>
  );
}
