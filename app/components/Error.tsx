'use client';

import { useState } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronRight } from 'lucide-react';

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorFallback({ 
  title = 'Đã xảy ra lỗi', 
  message = 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
  onRetry 
}: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-[#00173a] mb-2">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button onClick={onRetry} className="px-4 py-2 bg-[#00173a] text-white rounded-lg font-medium flex items-center gap-2 hover:bg-[#bb0012] transition-colors">
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </button>
          )}
          <a href="/" className="px-4 py-2 border border-slate-300 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-100 transition-colors">
            <Home className="w-4 h-4" />
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}

export function NotFound({ 
  title = 'Không tìm thấy', 
  message = 'Trang bạn đang tìm kiếm không tồn tại.',
  link = '/'
}: { 
  title?: string; 
  message?: string;
  link?: string;
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-slate-200 mb-4">404</div>
        <h2 className="text-xl font-bold text-[#00173a] mb-2">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <a href={link} className="px-4 py-2 bg-[#bb0012] text-white rounded-lg font-medium inline-flex items-center gap-2 hover:opacity-90 transition-colors">
          Về trang chủ
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}