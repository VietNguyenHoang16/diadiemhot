'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Share2, MessageCircle, Rss } from 'lucide-react';
import ContactForm from '@/app/components/ContactForm';

export default function Footer() {
  return (
    <footer className="bg-[#00173a] w-full pt-16 pb-8 px-8">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12">
        {/* Brand */}
        <div className="space-y-6">
          <Image src="/logo.png" alt="Thành Đạt" width={180} height={45} className="h-auto" />
          <p className="text-slate-400 text-sm leading-relaxed">
            Chuyên cung cấp các giải pháp và dịch vụ chất lượng cao. Được xác định bởi sự chính xác, truyền tải với phong cách.
          </p>
          <div className="space-y-1 text-xs text-slate-400">
            <p><span className="font-bold text-white/50">Địa chỉ:</span> 645/95/27 Nguyễn Kiệm, Phường 3, Hạnh Thông, Hồ Chí Minh</p>
          </div>
          <div className="flex gap-4">
            <Share2 className="w-5 h-5 text-white/40 hover:text-[#bb0012] cursor-pointer transition-colors" />
            <MessageCircle className="w-5 h-5 text-white/40 hover:text-[#bb0012] cursor-pointer transition-colors" />
            <Rss className="w-5 h-5 text-white/40 hover:text-[#bb0012] cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Information */}
        <div>
          <h4 className="text-sm uppercase tracking-widest text-white mb-6 font-black">Thông Tin</h4>
          <ul className="space-y-3 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <li><Link href="/ve-chung-toi" className="hover:text-[#bb0012] transition-colors">Về Chúng Tôi</Link></li>
            <li><Link href="/tieu-chuan-bien-tap" className="hover:text-[#bb0012] transition-colors">Tiêu Chuẩn Biên Tập</Link></li>
            <li><Link href="/chinh-sach-bao-mat" className="hover:text-[#bb0012] transition-colors">Chính Sách Bảo Mật</Link></li>
            <li><Link href="/dieu-khoan-su-dung" className="hover:text-[#bb0012] transition-colors">Điều Khoản Sử Dụng</Link></li>
          </ul>
        </div>

        {/* Contact Form */}
        <div>
          <h4 className="text-sm uppercase tracking-widest text-white mb-6 font-black">Liên Hệ</h4>
          <p className="text-slate-400 text-xs mb-4 leading-relaxed">
            Để lại email và số điện thoại, chúng tôi sẽ liên hệ lại.
          </p>
          <ContactForm variant="footer" buttonText="Gửi Liên Hệ" />
          <div className="mt-4 space-y-1">
            <p className="text-slate-400 text-xs">
              <span className="font-bold text-white/60">Email:</span>{' '}
              <a href="mailto:anivia161@gmail.com" className="hover:text-[#bb0012]">anivia161@gmail.com</a>
            </p>
            <p className="text-slate-400 text-xs">
              <span className="font-bold text-white/60">Điện thoại:</span>{' '}
              <a href="tel:0901400248" className="hover:text-[#bb0012]">0901.400.248</a>
            </p>
          </div>
        </div>

        {/* Quick Tags */}
        <div>
          <h4 className="text-sm uppercase tracking-widest text-white mb-6 font-black">Tags Nhanh</h4>
          <div className="flex flex-wrap gap-2">
            {['Du Lịch', 'Ẩm Thực', 'Review', 'Xếp Hạng', 'Phong Cách'].map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-white/5 rounded text-xs text-slate-400 font-bold uppercase tracking-widest hover:bg-[#bb0012] hover:text-white cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="text-slate-400 text-xs uppercase tracking-[0.3em] text-center pt-8">
        © 2024 Công Ty Cổ Phần Dịch Vụ Thành Đạt. Mọi quyền được bảo lưu.
      </div>
    </footer>
  );
}
