'use client';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-2 border-slate-200 border-t-[#bb0012] rounded-full animate-spin`}></div>
    </div>
  );
}

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 rounded"></div>
      ))}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#bb0012] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Đang tải...</p>
      </div>
    </div>
  );
}

export function LoadingButton({ text = 'Đang xử lý...' }: { text?: string }) {
  return (
    <button disabled className="px-6 py-3 bg-slate-300 text-white font-bold rounded-lg flex items-center gap-2 cursor-not-allowed">
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      <span>{text}</span>
    </button>
  );
}