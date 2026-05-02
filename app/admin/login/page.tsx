'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password.trim() 
        }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#00173a] flex items-center justify-center p-4 font-['Be_Vietnam_Pro']">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-[8px] border-[#bb0012] animate-in fade-in zoom-in duration-500">
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-[#bb0012]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-[#bb0012]" />
            </div>
            <h1 className="text-3xl font-black text-[#00173a] uppercase tracking-tighter mb-2">Admin Access</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Hệ thống quản lý Địa Điểm Hot</p>
          </div>

          <form onSubmit={handleLogin} className="px-10 pb-12 space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#bb0012] transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="Username"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#bb0012]/20 rounded-2xl outline-none font-bold text-[#00173a] transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#bb0012] transition-colors" />
                <input
                  required
                  type="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#bb0012]/20 rounded-2xl outline-none font-bold text-[#00173a] transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 text-center uppercase tracking-tighter">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-[#00173a] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#bb0012] transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Đăng nhập hệ thống'}
            </button>
          </form>
        </div>
        <p className="text-center mt-8 text-white/20 font-black uppercase tracking-[0.5em] text-[10px]">DIADIEMTOT MANAGEMENT SYSTEM</p>
      </div>
    </main>
  );
}
