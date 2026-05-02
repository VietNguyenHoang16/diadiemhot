'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  Copy,
  Eye,
  Quote,
  Share2,
  Star,
  UserRound,
} from 'lucide-react';

const sections = [
  {
    id: 'tong-quan',
    title: 'Tổng quan nhanh',
    content: [
      'Spa Ngọc Lan ghi điểm nhờ không gian sạch, quy trình tiếp đón gọn gàng và đội ngũ kỹ thuật viên làm việc đồng đều. Trải nghiệm phù hợp nhất với khách hàng muốn tìm một địa chỉ chăm sóc da mặt, massage thư giãn và liệu trình body trong phân khúc trung cao tại Đồng Xoài.',
      'Điểm mạnh lớn nhất là cảm giác chuyên nghiệp từ lúc bước vào: khu lễ tân sáng, mùi hương nhẹ, nhân sự tư vấn không quá ép sale và khu trị liệu có độ riêng tư tốt. Đây là lý do bài viết này xếp Spa Ngọc Lan vào nhóm top 3 spa chuyên nghiệp đáng trải nghiệm trong năm 2025.',
    ],
  },
  {
    id: 'ly-do-noi-bat',
    title: 'Vì sao Spa Ngọc Lan vào top 3',
    content: [
      'Thứ nhất là tính ổn định. Nhiều spa có một vài buổi làm rất tốt nhưng chất lượng dao động giữa các ca. Với Spa Ngọc Lan, trải nghiệm nổi bật nằm ở việc quy trình được chuẩn hóa, từ bước thăm hỏi tình trạng da, gợi ý liệu trình đến chăm sóc sau dịch vụ.',
      'Thứ hai là không gian được đầu tư chỉn chu. Tông màu kem, gỗ sáng và ánh sáng ấm khiến tổng thể sang nhưng không lạnh. Khu phòng treatment đủ riêng tư, phù hợp nhóm khách hàng nữ văn phòng lẫn khách đi theo cặp mẹ con hoặc bạn bè.',
      'Thứ ba là khả năng kết hợp dịch vụ. Spa không chỉ mạnh về facial mà còn có các gói thư giãn body, chăm sóc chuyên sâu trước dịp event hoặc cưới hỏi. Điều này giúp khách quay lại nhiều lần thay vì chỉ dùng một dịch vụ đơn lẻ.',
    ],
  },
  {
    id: 'trai-nghiem-thuc-te',
    title: 'Trải nghiệm thực tế',
    content: [
      'Quá trình check-in diễn ra nhanh, khu chờ có trà ấm và khăn lạnh. Nhân viên hỏi khá kỹ về độ nhạy cảm của da, tiền sử kích ứng và mong muốn chính trước khi đề xuất liệu trình. Đây là một điểm cộng lớn vì nhiều spa địa phương thường bỏ qua phần sàng lọc ban đầu.',
      'Trong buổi trải nghiệm, thao tác làm sạch, xông, massage và khóa ẩm diễn ra nhịp nhàng. Kỹ thuật viên giữ áp lực tay ổn định, không nói chuyện quá nhiều và luôn báo trước khi chuyển bước. Cảm giác chung là thư giãn và được chăm sóc có chủ đích, không làm cho đủ quy trình.',
      'Sau khi kết thúc, phần tư vấn hậu liệu trình được trình bày rõ ràng: nên tránh gì trong 24 giờ đầu, cần dùng sản phẩm nào tại nhà và khi nào nên quay lại. Cách làm này tạo cảm giác tin cậy hơn đáng kể.',
    ],
  },
  {
    id: 'gia-ca-phu-hop',
    title: 'Giá cả và nhóm khách phù hợp',
    content: [
      'Mức giá của Spa Ngọc Lan không phải rẻ nhất tại Đồng Xoài nhưng hợp lý nếu so với chất lượng không gian và tay nghề. Nhóm khách phù hợp nhất là dân văn phòng, người cần thư giãn sau giờ làm hoặc khách muốn tìm một địa chỉ đủ chỉn chu để duy trì chăm sóc lâu dài.',
      'Nếu bạn chỉ cần một nơi làm nhanh, giá thấp, nhiều chương trình giảm sâu thì đây có thể chưa phải lựa chọn số một. Nhưng nếu ưu tiên trải nghiệm ổn định và dịch vụ chuyên nghiệp, Spa Ngọc Lan đáng để thử.',
    ],
  },
  {
    id: 'ket-luan',
    title: 'Kết luận',
    content: [
      'Spa Ngọc Lan là một ví dụ khá rõ của mô hình spa địa phương nhưng vận hành theo tiêu chuẩn dịch vụ cao hơn mặt bằng chung. Không gian đẹp, đội ngũ tư vấn có kiểm soát và kỹ thuật viên làm việc đều tay là ba yếu tố khiến địa chỉ này nổi bật trong năm 2025.',
      'Nếu cần chọn một nơi để trải nghiệm lần đầu hoặc mua voucher tặng người thân tại Đồng Xoài, đây là cái tên xứng đáng nằm trong danh sách ưu tiên.',
    ],
  },
];

const relatedPosts = [
  {
    href: '/du-lich',
    category: 'Chăm Sóc',
    title: '7 tiêu chí nhận biết một spa chuyên nghiệp trước khi đặt lịch',
    excerpt: 'Checklist ngắn để tránh chọn nhầm địa điểm chỉ đẹp hình nhưng chất lượng thiếu ổn định.',
  },
  {
    href: '/phong-cach',
    category: 'Xếp Hạng',
    title: 'Top địa chỉ massage thư giãn được dân văn phòng Đồng Xoài nhắc nhiều',
    excerpt: 'Danh sách ưu tiên theo trải nghiệm thực tế, độ riêng tư và dịch vụ chăm sóc sau buổi.',
  },
  {
    href: '/blog',
    category: 'Review',
    title: 'Có nên mua combo facial dài hạn? Ưu và nhược điểm cần biết',
    excerpt: 'Một góc nhìn thực tế cho khách hàng đang cân nhắc gói liệu trình nhiều buổi.',
  },
];

export default function SpaNgocLanReviewPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6efe8_0%,#fffaf7_24%,#ffffff_100%)] font-['Be_Vietnam_Pro'] text-[#00173a]">
      <section className="border-b border-[#00173a]/8 bg-[radial-gradient(circle_at_top_left,rgba(187,0,18,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(0,23,58,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.84))]">
        <div className="mx-auto max-w-screen-2xl px-6 pb-16 pt-10 md:px-10 lg:px-12">
          <a
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#00173a]/10 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#00173a] transition-colors hover:border-[#bb0012] hover:text-[#bb0012]"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Blog
          </a>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_340px] lg:items-end">
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em]">
                <span className="rounded-full bg-[#bb0012] px-4 py-2 text-white shadow-lg shadow-[#bb0012]/20">
                  Xếp Hạng Spa
                </span>
                <span className="rounded-full border border-[#00173a]/10 bg-white/90 px-4 py-2 text-[#00173a]/60">
                  Đồng Xoài 2025
                </span>
              </div>

              <h1 className="w-full text-4xl font-black uppercase tracking-[-0.05em] text-[#00173a] sm:text-5xl lg:text-7xl">
                Đánh giá Spa Ngọc Lan
                <span className="mt-3 block text-[#bb0012]">Top 3 spa chuyên nghiệp nhất Đồng Xoài 2025</span>
              </h1>

              <p className="mt-6 max-w-4xl text-base font-medium leading-8 text-slate-600 md:text-lg">
                Một trang mẫu theo phong cách editorial để bạn xem trước cách triển khai bài review cao cấp: có mở bài nổi bật,
                mục lục rõ ràng, thông tin biên tập viên, nút chia sẻ và phần bài viết liên quan ở cuối.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[2.25rem] border border-[#00173a]/8 bg-white/80 p-6 shadow-[0_18px_50px_rgba(0,23,58,0.06)] backdrop-blur-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#00173a_0%,#bb0012_100%)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Trọng tâm bài viết</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-[#fff8f5] px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#bb0012]">01</p>
                  <p className="mt-2 text-sm font-black leading-7 text-[#00173a]">Quy trình tiếp đón và tư vấn có cảm giác chuyên nghiệp ngay từ đầu.</p>
                </div>
                <div className="rounded-2xl bg-[#f8fafc] px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#bb0012]">02</p>
                  <p className="mt-2 text-sm font-black leading-7 text-[#00173a]">Không gian riêng tư, sạch và phù hợp nhóm khách cần thư giãn thật sự.</p>
                </div>
                <div className="rounded-2xl bg-[#fff8f5] px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#bb0012]">03</p>
                  <p className="mt-2 text-sm font-black leading-7 text-[#00173a]">Đây là bài review thiên về trải nghiệm dịch vụ, không phải bài quảng cáo bán gói.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-6 py-10 md:px-10 lg:px-12">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0">
            <div className="mb-8 overflow-hidden rounded-[2.75rem] border border-[#00173a]/8 bg-white shadow-[0_18px_60px_rgba(0,23,58,0.08)]">
              <div className="relative aspect-[16/8] overflow-hidden bg-[linear-gradient(135deg,#00173a_0%,#0c2b61_42%,#bb0012_100%)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.32),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(255,228,196,0.18),transparent_20%),linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                    <Star className="h-4 w-4 fill-current" />
                    Bài viết mẫu giao diện
                  </div>
                  <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/86 md:text-base">
                    Hero có thể thay bằng ảnh thật của spa sau này. Hiện tại mình dùng một bố cục gradient sang trọng để bạn xem form trình bày.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 border-t border-[#00173a]/6 bg-[#fffdfb] p-6 md:grid-cols-3 md:p-8">
                <div className="rounded-[1.75rem] border border-[#00173a]/8 bg-white p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">VT</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00173a] text-white">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-[#00173a]">Viet Tran</p>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Biên tập viên</p>
                    </div>
                  </div>
                </div>


                <div className="rounded-[1.75rem] border border-[#00173a]/8 bg-white p-5">
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Lượt xem</span>
                      <span className="font-black text-[#00173a]">1,842</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Đọc mất</span>
                      <span className="font-black text-[#00173a]">5 phút</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 rounded-[2.5rem] border border-[#00173a]/8 bg-white p-6 shadow-[0_18px_50px_rgba(0,23,58,0.06)] md:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                    <Share2 className="h-4 w-4 text-[#bb0012]" />
                    Chia sẻ:
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {['f', 'Z', 'in'].map((item) => (
                      <button
                        key={item}
                        className="flex h-12 min-w-12 items-center justify-center rounded-2xl border border-[#00173a]/8 bg-[#fff8f5] px-4 text-sm font-black text-[#00173a] transition-all hover:-translate-y-0.5 hover:border-[#bb0012] hover:text-[#bb0012]"
                        type="button"
                      >
                        {item}
                      </button>
                    ))}
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#00173a]/8 bg-white px-5 py-3 text-sm font-black text-[#00173a] transition-all hover:-translate-y-0.5 hover:border-[#bb0012] hover:text-[#bb0012]"
                      type="button"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? 'Đã sao chép' : 'Sao chép link'}
                    </button>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-[#bb0012]/10 bg-[#fff6f4] px-5 py-4 text-sm font-semibold text-slate-600">
                  Đây là bài demo giao diện. Khi bạn muốn, mình có thể nối tiếp sang dữ liệu thật từ Prisma để mọi bài viết dùng cùng một template này.
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2.5rem] border border-[#00173a]/8 bg-white p-7 shadow-[0_18px_50px_rgba(0,23,58,0.06)] md:p-10">
                <div className="mb-8 flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-[#bb0012] text-white shadow-lg shadow-[#bb0012]/20">
                    <Quote className="h-6 w-6" />
                  </div>
                  <p className="max-w-3xl text-xl font-black leading-10 text-[#00173a] md:text-2xl">
                    Spa Ngọc Lan phù hợp với khách hàng cần một địa chỉ có cảm giác chăm sóc chuyên nghiệp, quy trình rõ ràng và đủ sang để quay lại nhiều lần.
                  </p>
                </div>

                {sections.map((section, index) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className={index === 0 ? '' : 'mt-12 border-t border-[#00173a]/6 pt-12'}
                  >
                    <div className="mb-6 flex items-center gap-4">
                      <span className="inline-flex min-w-14 items-center justify-center rounded-2xl bg-[#fff6f4] px-3 py-2 text-base font-black leading-none text-[#bb0012] md:text-lg">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h2 className="text-3xl font-black tracking-tight text-[#00173a] md:text-4xl">{section.title}</h2>
                    </div>

                    <div className="space-y-5 text-base font-medium leading-8 text-slate-600">
                      {section.content.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    {section.id === 'ly-do-noi-bat' && (
                      <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {[
                          'Quy trình tiếp đón và hỏi nhu cầu rõ ràng',
                          'Phòng dịch vụ riêng tư, sạch và có mùi hương dễ chịu',
                          'Chất lượng đồng đều giữa trải nghiệm thư giãn và chăm sóc da',
                        ].map((item) => (
                          <div key={item} className="rounded-[1.75rem] border border-[#00173a]/8 bg-[#fffaf7] p-5">
                            <p className="text-sm font-black leading-7 text-[#00173a]">{item}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>

              <section className="rounded-[2.5rem] border border-[#00173a]/8 bg-[#00173a] p-7 text-white shadow-[0_24px_70px_rgba(0,23,58,0.16)] md:p-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">Bài viết liên quan</p>
                    <h2 className="mt-3 text-3xl font-black uppercase tracking-tight md:text-4xl">Đọc tiếp theo</h2>
                  </div>
                  <a
                    href="/blog"
                    className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-white/70 transition-colors hover:text-[#ffb7bf]"
                  >
                    Xem tất cả
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                  {relatedPosts.map((post) => (
                    <a
                      key={post.title}
                      href={post.href}
                      className="group rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[#ffb7bf]/50 hover:bg-white/10"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ffb7bf]">{post.category}</p>
                      <h3 className="mt-4 text-xl font-black leading-8 text-white">{post.title}</h3>
                      <p className="mt-4 text-sm font-medium leading-7 text-white/68">{post.excerpt}</p>
                      <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-white/80 transition-all group-hover:gap-3">
                        Xem bài
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </article>

          <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
            <section className="rounded-[2.25rem] border border-[#00173a]/8 bg-white p-6 shadow-[0_18px_50px_rgba(0,23,58,0.06)]">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Mục lục</p>
              <div className="mt-5 space-y-2">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-500 transition-all hover:bg-[#fff6f4] hover:text-[#bb0012]"
                  >
                    <span className="inline-flex min-w-12 items-center justify-center rounded-xl bg-[#fff6f4] px-2.5 py-2 text-sm font-black leading-none text-[#bb0012]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{section.title}</span>
                  </a>
                ))}
              </div>
            </section>

            <section className="rounded-[2.25rem] border border-[#00173a]/8 bg-[#fffaf7] p-6 shadow-[0_18px_50px_rgba(0,23,58,0.05)]">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Thông tin bài viết</p>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4">
                  <span className="inline-flex items-center gap-2 text-slate-400">
                    <UserRound className="h-4 w-4" />
                    Tác giả
                  </span>
                  <span className="font-black text-[#00173a]">Viet Tran</span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4">
                  <span className="inline-flex items-center gap-2 text-slate-400">
                    <Eye className="h-4 w-4" />
                    Lượt xem
                  </span>
                  <span className="font-black text-[#00173a]">1,842</span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4">
                  <span className="inline-flex items-center gap-2 text-slate-400">
                    <Clock3 className="h-4 w-4" />
                    Đọc mất
                  </span>
                  <span className="font-black text-[#00173a]">5 phút</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

