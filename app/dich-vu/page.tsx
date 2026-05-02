'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import { MonitorSmartphone, Smartphone, LineChart, Server, Camera, Megaphone, CheckCircle2, ArrowRight, Star, X, Loader2 } from 'lucide-react';

const SERVICES = [
  {
    id: 'web',
    title: 'Thiết Kế Website',
    shortDesc: 'Chuẩn SEO, tích hợp đặt hàng, không hoa hồng bên thứ 3.',
    icon: MonitorSmartphone,
    stats: '+314% Lợi nhuận',
    fullDesc: 'Website không chỉ là bộ mặt của doanh nghiệp mà còn là cỗ máy in tiền tự động. Chúng tôi thiết kế website chuẩn SEO, tốc độ load siêu tốc và tối ưu UI/UX để biến người truy cập thành khách hàng ngay từ giây đầu tiên. Tránh xa mức phí hoa hồng cắt cổ từ Grab/ShopeeFood.',
    features: ['Tích hợp hệ thống đặt bàn/đặt hàng trực tiếp', 'Giao diện Mobile-first hoàn hảo', 'Chuẩn SEO Google lên top tự nhiên', 'Quản trị nội dung cực dễ dàng', 'Giữ 100% doanh thu (0% phí hoa hồng)'],
    color: 'from-[#00173a] to-blue-900',
    iconColor: 'text-blue-400',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-200',
  },
  {
    id: 'app',
    title: 'Xây Dựng App Order',
    shortDesc: 'App Loyalty riêng, gửi Push Notification miễn phí.',
    icon: Smartphone,
    stats: '100% Data KH',
    fullDesc: 'Khách hàng có tải app của bạn không? CÓ, nếu bạn cho họ mã giảm giá. Với ứng dụng iOS/Android độc quyền, bạn sở hữu vĩnh viễn tệp khách hàng trung thành, thoải mái gửi thông báo đẩy (Push) miễn phí để kéo khách quay lại bất cứ lúc nào.',
    features: ['Sở hữu toàn bộ Data khách hàng', 'Hệ thống tích điểm & Voucher thành viên', 'Gửi thông báo Push khuyến mãi 0 đồng', 'Đẩy app lên App Store & Google Play', 'Tự động nhắc nhở khách hàng cũ quay lại'],
    color: 'from-[#bb0012] to-red-900',
    iconColor: 'text-red-400',
    accentBg: 'bg-red-50',
    accentBorder: 'border-red-200',
  },
  {
    id: 'seo',
    title: 'Tối Ưu SEO & Lên Top',
    shortDesc: 'Chiếm lĩnh trang 1 Google, khách hàng tự tìm đến.',
    icon: LineChart,
    stats: 'Top 1 Google',
    fullDesc: 'Hãy tưởng tượng khách hàng gõ "quán nhậu ngon gần đây" và quán của bạn hiện lên đầu tiên. Bằng sức mạnh truyền thông của Địa Điểm Hot, chúng tôi bơm backlink chất lượng và SEO kỹ thuật để địa điểm của bạn thống trị kết quả tìm kiếm.',
    features: ['Nghiên cứu từ khóa ngách F&B/Dịch vụ', 'Bơm Backlink chất lượng từ hệ thống Địa Điểm Hot', 'Tối ưu Local SEO (Google Maps)', 'Bài viết Review chuẩn SEO', 'Cam kết KPIs rõ ràng'],
    color: 'from-emerald-700 to-green-900',
    iconColor: 'text-emerald-400',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
  },
  {
    id: 'setup',
    title: 'Setup IT & POS',
    shortDesc: 'Mạng Wifi Marketing, máy tính tiền, camera.',
    icon: Server,
    stats: 'Vận hành 24/7',
    fullDesc: 'Máy tính tiền treo, Wifi yếu, in bill lỗi vào lúc cao điểm là ác mộng. Chúng tôi cung cấp và lắp đặt trọn gói hệ thống phần mềm POS, mạng LAN/Wifi chịu tải cao, và đặc biệt là Wifi Marketing thu thập data (Khách đăng nhập Wifi phải để lại SĐT).',
    features: ['Thi công mạng nội bộ siêu tốc, chịu tải 1000 user', 'Lắp đặt máy POS & Cài đặt phần mềm bán hàng', 'Thiết lập Wifi Marketing lấy SĐT khách', 'Hệ thống Camera AI đếm khách', 'Bảo trì hệ thống định kỳ 24/7'],
    color: 'from-amber-600 to-orange-900',
    iconColor: 'text-amber-400',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
  },
  {
    id: 'media',
    title: 'Media Chụp/Quay',
    shortDesc: 'Chụp ảnh món ăn kích thích vị giác, quay clip viral.',
    icon: Camera,
    stats: '+200% Lượt Click',
    fullDesc: 'Khách hàng "ăn" bằng mắt trước khi ăn thật. Hình ảnh chụp cẩu thả trên Menu hay Grab làm giảm 50% khả năng chốt đơn. Đội ngũ Media chuyên nghiệp của chúng tôi sẽ biến món ăn của bạn thành tác phẩm nghệ thuật, nhìn là muốn đặt ngay.',
    features: ['Chụp ảnh menu tiêu chuẩn Studio', 'Quay video Review không gian quán', 'Sản xuất Video ngắn Tiktok/Reels bắt trend viral', 'Chụp ảnh không gian Flycam', 'Thiết kế Menu/Ấn phẩm in ấn'],
    color: 'from-purple-700 to-indigo-900',
    iconColor: 'text-purple-400',
    accentBg: 'bg-purple-50',
    accentBorder: 'border-purple-200',
  },
  {
    id: 'marketing',
    title: 'Phòng Marketing Thuê Ngoài',
    shortDesc: 'Thay vì thuê 1 nhân viên, hãy thuê 1 đội ngũ chuyên gia.',
    icon: Megaphone,
    stats: 'Tiết kiệm 60%',
    fullDesc: 'Đừng lãng phí 15-20 triệu/tháng cho 1 nhân sự Marketing non kinh nghiệm. Chỉ với một nửa chi phí, bạn sở hữu nguyên một "phòng Marketing" bao gồm: Content, Designer, Chạy Ads, Seeding... hoạt động năng suất và hiệu quả gấp 5 lần.',
    features: ['Lên kế hoạch nội dung Fanpage hàng tháng', 'Thiết kế hình ảnh/video bài viết chuyên nghiệp', 'Chạy quảng cáo Facebook Ads, Google Ads tối ưu', 'Seeding điều hướng dư luận các hội nhóm ẩm thực', 'Báo cáo hiệu quả (Leads/Reach) rõ ràng mỗi tuần'],
    color: 'from-pink-700 to-rose-900',
    iconColor: 'text-pink-400',
    accentBg: 'bg-pink-50',
    accentBorder: 'border-pink-200',
  }
];

const TESTIMONIALS = [
  { name: 'Minh Khoa', role: 'Chủ quán', business: 'Bếp Xanh Restaurant', quote: 'Từ khi có website riêng, doanh thu tăng 300% mà không phải trả tiền hoa hồng cho ai.', rating: 5 },
  { name: 'Thanh Hà', role: 'CEO', business: 'Milk Tea House', quote: 'App loyalty giúp khách hàng cũ quay lại liên tục. Đầu tư này xứng đáng từng đồng.', rating: 5 },
  { name: 'Hoàng Nam', role: 'Founder', business: 'Sushi King VN', quote: 'Team media chụp ảnh món ăn đẹp đến nghĩ đang quảng cáo cho đối thủ.', rating: 5 },
];

export default function DichVuPage() {
  const [activeService, setActiveService] = useState<typeof SERVICES[0] | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [formData, setFormData] = useState({ contactName: '', phone: '', email: '', businessName: '', description: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (activeService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [activeService]);

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.email && !formData.phone) return;
    setFormStatus('loading');
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, package: activeService?.title }),
      });
      if (!res.ok) throw new Error();
      setFormStatus('success');
      setFormData({ contactName: '', phone: '', email: '', businessName: '', description: '' });
      setTimeout(() => {
        setFormStatus('idle');
        setShowQuoteForm(false);
        setActiveService(null);
      }, 2000);
    } catch {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 3000);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Header activeLink="dich-vu" as any />

      {/* SERVICES GRID */}
      <section id="dich-vu" className="py-20 px-8 bg-slate-50">
        <div className="max-w-screen-2xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block bg-[#bb0012]/10 text-[#bb0012] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Dịch Vụ Của Chúng Tôi
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#00173a] tracking-tighter mb-4">
              Giải Pháp Toàn Diện
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Từ website đến marketing, chúng tôi cung cấp trọn bộ công cụ giúp bạn thống trị thị trường F&B
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  onClick={() => setActiveService(service)}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-transparent shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                >
                  {/* Colored top border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${service.color}`} />

                  <div className="p-8">
                    {/* Icon & Stats Row */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`${service.accentBg} p-4 rounded-2xl`}>
                        <Icon className={`w-8 h-8 ${service.iconColor}`} />
                      </div>
                      <span className={`inline-flex items-center gap-1 ${service.accentBg} ${service.accentBorder} border text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full`}>
                        {service.stats}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-black text-[#00173a] tracking-tight mb-3 group-hover:text-[#bb0012] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2">
                      {service.shortDesc}
                    </p>

                    {/* Features Preview */}
                    <ul className="space-y-2 mb-6">
                      {service.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-500 text-sm">
                          <CheckCircle2 className={`w-4 h-4 ${service.iconColor} shrink-0`} />
                          <span className="line-clamp-1">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-[#bb0012] font-bold text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                      Xem chi tiết <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 px-8 bg-[#00173a]">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-white/10 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Khách Hàng Nói Gì
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              Thành Công Của Họ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/80 text-lg leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-white/10 pt-4">
                  <div className="font-black text-white">{testimonial.name}</div>
                  <div className="text-white/50 text-sm">{testimonial.role}</div>
                  <div className="text-[#bb0012] text-sm font-bold mt-1">{testimonial.business}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-8 bg-gradient-to-r from-[#bb0012] to-[#a00010]">
        <div className="max-w-screen-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">
            Sẵn Sàng Bứt Phá?
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
            Để lại số điện thoại, chúng tôi sẽ tư vấn giải pháp phù hợp nhất với ngành F&B của bạn
          </p>
          <Link href="/lien-he" className="inline-flex items-center gap-2 bg-white text-[#bb0012] px-10 py-5 rounded-lg font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-all shadow-xl">
            Liên Hệ Ngay <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />

      {/* MODAL POPUP */}
      {activeService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
          <div
            className="absolute inset-0 bg-[#00173a]/80 backdrop-blur-sm transition-opacity"
            onClick={() => { setActiveService(null); setShowQuoteForm(false); }}
          />

          <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {/* Modal Left */}
            <div className={`hidden md:flex md:w-2/5 bg-gradient-to-br ${activeService.color} p-8 flex-col justify-between items-center text-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10" />

              <div className="relative z-10 w-full mt-8">
                <div className="bg-white/10 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20 shadow-xl">
                  <activeService.icon className={`w-14 h-14 ${activeService.iconColor}`} />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter mb-4">{activeService.title}</h2>
                <div className="inline-block bg-white/20 text-white text-sm font-black uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-md">
                  {activeService.stats}
                </div>
              </div>

              {!showQuoteForm && (
                <div className="relative z-10 w-full pb-4">
                  <button onClick={() => setShowQuoteForm(true)} className="block w-full bg-white text-[#00173a] hover:bg-slate-100 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-colors shadow-lg text-center">
                    Nhận Báo Giá
                  </button>
                </div>
              )}
            </div>

            {/* Modal Right Content */}
            <div className="w-full md:w-3/5 p-6 md:p-10 overflow-y-auto">
              <button onClick={() => { setActiveService(null); setShowQuoteForm(false); }} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 md:hidden transition-colors z-10">
                <X className="w-5 h-5" />
              </button>

              {!showQuoteForm ? (
                <>
                  <div className="md:hidden mb-6">
                    <div className={`${activeService.accentBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}>
                      <activeService.icon className={`w-8 h-8 ${activeService.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-black text-[#00173a] tracking-tight mb-1">{activeService.title}</h3>
                    <span className={`inline-flex ${activeService.accentBg} ${activeService.accentBorder} border text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full`}>
                      {activeService.stats}
                    </span>
                  </div>

                  <div className="hidden md:block mb-8">
                    <h3 className="text-xl font-black text-[#00173a] tracking-tight mb-2">{activeService.title}</h3>
                    <h4 className="text-xs font-black text-[#bb0012] uppercase tracking-widest">Dịch vụ</h4>
                  </div>

                  <p className="text-slate-600 text-base leading-relaxed mb-8">
                    {activeService.fullDesc}
                  </p>

                  <h4 className="text-sm font-black text-[#00173a] uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                    Quyền lợi bạn nhận được
                  </h4>
                  <ul className="space-y-4 mb-8">
                    {activeService.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700">
                        <CheckCircle2 className={`w-5 h-5 ${activeService.iconColor} shrink-0 mt-0.5`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="md:hidden">
                    <button onClick={() => setShowQuoteForm(true)} className="block w-full bg-[#bb0012] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm text-center transition-colors shadow-lg">
                      Nhận Báo Giá Ngay
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Quote Form */}
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-[#00173a] tracking-tight mb-1">Nhận Báo Giá</h3>
                    <h4 className="text-xs font-black text-[#bb0012] uppercase tracking-widest">{activeService.title}</h4>
                  </div>

                  {formStatus === 'success' ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </div>
                      <h4 className="text-xl font-black text-[#00173a] mb-2">Đã gửi thành công!</h4>
                      <p className="text-slate-500 text-sm">Chúng tôi sẽ liên hệ lại trong 24 giờ.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleQuoteSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Họ tên *</label>
                        <input
                          type="text"
                          required
                          value={formData.contactName}
                          onChange={e => setFormData(f => ({ ...f, contactName: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-[#00173a] focus:ring-2 focus:ring-[#bb0012]/20 focus:border-[#bb0012] outline-none"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Số điện thoại *</label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-[#00173a] focus:ring-2 focus:ring-[#bb0012]/20 focus:border-[#bb0012] outline-none"
                            placeholder="0912 xxx xxx"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-[#00173a] focus:ring-2 focus:ring-[#bb0012]/20 focus:border-[#bb0012] outline-none"
                            placeholder="email@cuaban.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tên doanh nghiệp</label>
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={e => setFormData(f => ({ ...f, businessName: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-[#00173a] focus:ring-2 focus:ring-[#bb0012]/20 focus:border-[#bb0012] outline-none"
                          placeholder="Quán ăn của bạn"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Mô tả nhu cầu</label>
                        <textarea
                          rows={3}
                          value={formData.description}
                          onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-[#00173a] focus:ring-2 focus:ring-[#bb0012]/20 focus:border-[#bb0012] outline-none resize-none"
                          placeholder="Mô tả briefly về nhu cầu của bạn..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={formStatus === 'loading'}
                        className="w-full bg-[#bb0012] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-colors shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {formStatus === 'loading' ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
                        ) : formStatus === 'error' ? (
                          'Lỗi, thử lại'
                        ) : (
                          'Gửi Yêu Cầu'
                        )}
                      </button>
                      <p className="text-xs text-slate-400 text-center">Đã gửi thông tin, chúng tôi sẽ liên hệ trong 24h.</p>
                    </form>
                  )}

                  <button onClick={() => setShowQuoteForm(false)} className="hidden md:flex items-center gap-2 text-slate-500 text-sm mt-4 hover:text-[#00173a] transition-colors">
                    ← Quay lại
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
