import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Scale, ShieldCheck, Star, FileText, Eye, Clock, ThumbsUp } from 'lucide-react';

export default function TieuChuanBienTap() {
  return (
    <main className="min-h-screen bg-white">
      <Header showNewsTicker={true} activeLink="blog" />

      <article className="mx-auto max-w-screen-2xl px-8 pb-24 pt-40">
        <div className="mx-auto max-w-4xl">
          <header className="mb-16 space-y-6 border-b border-slate-100 pb-12">
            <span className="inline-block rounded-full bg-[#bb0012] px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Quy Trình
            </span>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-[#00173a] md:text-7xl">
              Tiêu Chuẩn Biên Tập
            </h1>
            <p className="text-xl font-medium leading-relaxed text-slate-500">
              Mọi bài viết trên Địa Điểm Hot đều tuân theo bộ tiêu chuẩn nghiêm ngặt — đây là lý do độc giả tin tưởng chúng tôi.
            </p>
          </header>

          <div className="prose prose-lg max-w-none space-y-16">
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <ShieldCheck className="h-6 w-6 text-[#bb0012]" />
                Nguyên Tắc Nền Tảng
              </h2>
              <p className="leading-relaxed text-slate-600">
                Địa Điểm Hot áp dụng mô hình <strong className="text-[#00173a]">pay-to-play hoàn toàn bị loại trừ</strong>. Không doanh nghiệp nào có thể trả phí để được giới thiệu. Không nội dung nào được viết bởi bên có lợi ích kinh doanh liên quan.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { icon: ThumbsUp, text: 'Không nhận phí giới thiệu dưới mọi hình thức' },
                  { icon: ThumbsUp, text: 'Không viết bài theo đơn đặt hàng của doanh nghiệp' },
                  { icon: ThumbsUp, text: 'Không chấp nhận đổi đánh giá lấy quảng cáo' },
                  { icon: ThumbsUp, text: 'Không che giấu điểm yếu của địa điểm được giới thiệu' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4">
                    <item.icon className="h-5 w-5 shrink-0 text-[#bb0012]" />
                    <span className="text-sm font-semibold text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <FileText className="h-6 w-6 text-[#bb0012]" />
                Quy Trình Đánh Giá
              </h2>
              <p className="leading-relaxed text-slate-600">
                Mỗi địa điểm trước khi được giới thiệu phải trải qua quy trình đánh giá đa chiều, không thiên vị và có thể tái kiểm chứng.
              </p>
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Khám Phá Ban Đầu', desc: 'Đội ngũ biên tập tự khám phá và chọn lọc địa điểm dựa trên tiêu chí chất lượng — không dựa trên đề xuất từ doanh nghiệp.' },
                  { step: '02', title: 'Trải Nghiệm Thực Tế', desc: 'Ít nhất 2 thành viên trong đội ngũ trải nghiệm độc lập, ghi chép chi tiết về chất lượng dịch vụ, không gian, và giá cả.' },
                  { step: '03', title: 'So Sánh Đối Chiếu', desc: 'Địa điểm được đặt cạnh các đối thủ cùng phân khúc để đảm bảo đánh giá mang tính tương đối và công bằng.' },
                  { step: '04', title: 'Biên Tập & Xuất Bản', desc: 'Bài viết phải đạt tiêu chuẩn về độ chính xác, tính hữu ích và phong cách trình bày trước khi xuất bản.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-6 rounded-2xl border border-slate-100 p-6">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00173a] text-xl font-black text-white">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="mb-2 font-black text-[#00173a]">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Scale className="h-6 w-6 text-[#bb0012]" />
                Tiêu Chí Đánh Giá
              </h2>
              <p className="leading-relaxed text-slate-600">
                Mỗi địa điểm được chấm điểm trên 6 tiêu chí cốt lõi. Tất cả đều được công khai để độc giả hiểu rõ cách chúng tôi đánh giá.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Chất Lượng Sản Phẩm/Dịch Vụ', weight: '25%', desc: 'Đánh giá cốt lõi nhất — sản phẩm hoặc dịch vụ có xứng đáng với giá tiền không.' },
                  { label: 'Không Gian & Thiết Kế', weight: '20%', desc: 'Mức độ đầu tư, sáng tạo và sự phù hợp của không gian với đối tượng khách hàng mục tiêu.' },
                  { label: 'Vị Trí & Khả Năng Tiếp Cận', weight: '15%', desc: 'Thuận tiện di chuyển, có chỗ để xe, phù hợp với nhiều nhóm đối tượng.' },
                  { label: 'Phong Cách Phục Vụ', weight: '15%', desc: 'Thái độ nhân viên, mức độ chuyên nghiệp và sự thân thiện trong trải nghiệm.' },
                  { label: 'Giá Trị Chi Phí', weight: '15%', desc: 'So sánh giữa chất lượng thực tế và mức giá phải trả — có xứng đáng hay không.' },
                  { label: 'Độ Tin Cậy & Nhất Quán', weight: '10%', desc: 'Chất lượng có ổn định qua các lần ghé thăm hay không.' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-[#00173a]">{item.label}</h3>
                        <span className="rounded-full bg-[#bb0012] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">{item.weight}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Clock className="h-6 w-6 text-[#bb0012]" />
                Cập Nhật & Duy Trì
              </h2>
              <p className="leading-relaxed text-slate-600">
                Đánh giá không phải một snapshot tại thời điểm viết — chúng tôi duy trì và cập nhật định kỳ để phản ánh thực tế hiện tại.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { label: 'Định kỳ', value: '6 tháng/lần', desc: 'Tất cả địa điểm được review lại' },
                  { label: 'Theo sự kiện', value: 'Khi có thay đổi lớn', desc: 'Đổi chủ, đổi menu, thay đổi mô hình' },
                  { label: 'Theo phản hồi', value: 'Khi có khiếu nại', desc: 'Độc giả phản ánh sai sự thật' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 p-6">
                    <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                    <div className="mb-1 text-xl font-black text-[#00173a]">{item.value}</div>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Star className="h-6 w-6 text-[#bb0012]" />
                Hệ Thống Xếp Hạng
              </h2>
              <div className="overflow-hidden rounded-3xl border border-slate-100">
                <div className="grid grid-cols-5 border-b border-slate-100 bg-slate-50">
                  {['Điểm', '1-2', '3-4', '5-6', '7-8'].map((h, i) => (
                    <div key={h} className={`p-4 text-center text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-slate-400' : 'text-[#00173a]'}`}>{h}</div>
                  ))}
                </div>
                <div className="grid grid-cols-5 border-b border-slate-100">
                  {['Đánh giá', 'Tránh xa', 'Bình thường', 'Khá tốt', 'Xuất sắc'].map((h, i) => (
                    <div key={h} className={`p-4 text-center text-sm font-semibold ${i === 0 ? 'text-slate-400' : i < 4 ? 'text-slate-600' : 'text-[#bb0012]'}`}>{h}</div>
                  ))}
                </div>
                <div className="grid grid-cols-5">
                  {['Giới thiệu', 'Có', 'Có — với lưu ý', 'Có mạnh', 'Rất Highly Recommend'].map((h, i) => (
                    <div key={h} className={`p-4 text-center text-xs font-semibold ${i === 0 ? 'text-slate-400' : i < 4 ? 'text-slate-600' : 'text-[#bb0012]'}`}>{h}</div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Chỉ những địa điểm đạt <strong className="text-[#00173a]">7 điểm trở lên</strong> mới được xuất bản trên Địa Điểm Hot.
              </p>
            </section>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
