import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { CheckCircle, Target, Eye, Users, Award, Heart } from 'lucide-react';

export default function VeChungToi() {
  return (
    <main className="min-h-screen bg-white">
      <Header showNewsTicker={true} activeLink="blog" />

      <article className="mx-auto max-w-screen-2xl px-8 pb-24 pt-40">
        <div className="mx-auto max-w-4xl">
          <header className="mb-16 space-y-6 border-b border-slate-100 pb-12">
            <span className="inline-block rounded-full bg-[#bb0012] px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Giới Thiệu
            </span>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-[#00173a] md:text-7xl">
              Về Chúng Tôi
            </h1>
            <p className="text-xl font-medium leading-relaxed text-slate-500">
              Địa Điểm Hot — Nền tảng chọn lọc địa điểm đầu tiên tại Việt Nam được xây dựng trên nền tảng đạo đức biên tập nghiêm ngặt.
            </p>
          </header>

          <div className="prose prose-lg max-w-none space-y-16">
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Target className="h-6 w-6 text-[#bb0012]" />
                Sứ Mệnh
              </h2>
              <p className="leading-relaxed text-slate-600">
                Chúng tôi tin rằng trong thế giới đầy rẫy thông tin, việc chọn lọc trở nên quan trọng hơn bao giờ hết. Địa Điểm Hot ra đời với một mục tiêu duy nhất:{' '}
                <strong className="text-[#00173a]">đưa đến người đọc những đánh giá trung thực, khách quan và có giá trị thực sự</strong>.
              </p>
              <p className="leading-relaxed text-slate-600">
                Không quảng cáo mờ nhạt. Không bài viết sến súa. Chỉ những địa điểm xứng đáng được giới thiệu — theo cách mà người hiện đại tinh tế mong đợi.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Eye className="h-6 w-6 text-[#bb0012]" />
                Tầm Nhìn
              </h2>
              <p className="leading-relaxed text-slate-600">
                Trở thành thước đo chuẩn mực cho chất lượng địa điểm tại Việt Nam — nơi mà cả doanh nghiệp lẫn người tiêu dùng có thể tin tưởng để đưa ra quyết định.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {[
                  { label: 'Đánh giá trung thực', desc: 'Mọi bài viết đều phản ánh đúng thực tế' },
                  { label: 'Chọn lọc nghiêm ngặt', desc: 'Chỉ 5% địa điểm được giới thiệu' },
                  { label: 'Cập nhật liên tục', desc: 'Thông tin luôn mới và chính xác' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                    <CheckCircle className="mb-3 h-5 w-5 text-[#bb0012]" />
                    <h3 className="mb-1 font-black text-[#00173a]">{item.label}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Users className="h-6 w-6 text-[#bb0012]" />
                Đội Ngũ
              </h2>
              <p className="leading-relaxed text-slate-600">
                Đội ngũ biên tập viên Địa Điểm Hot là những người yêu thích ẩm thực, du lịch và phong cách sống — những người dành hàng trăm giờ mỗi tháng để khám phá, trải nghiệm và đánh giá từng địa điểm một cách khách quan nhất.
              </p>
              <p className="leading-relaxed text-slate-600">
                Chúng tôi không nhận phí để đưa địa điểm lên. Doanh nghiệp không thể mua vị trí. Đánh giá không thể được mua. Đây là nguyên tắc nền tảng không thể thỏa hiệp.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Award className="h-6 w-6 text-[#bb0012]" />
                Cam Kết
              </h2>
              <div className="space-y-4">
                {[
                  { title: 'Độc lập tuyệt đối', desc: 'Không phụ thuộc vào bất kỳ tổ chức hay thương hiệu nào. Đánh giá chỉ dựa trên trải nghiệm thực tế.' },
                  { title: 'Minh bạch hoàn toàn', desc: 'Mọi tiêu chí đánh giá được công khai. Độc giả luôn biết chúng tôi đánh giá theo thang điểm nào.' },
                  { title: 'Trách nhiệm với cộng đồng', desc: 'Chúng tôi chỉ giới thiệu những nơi xứng đáng — không phân biệt quy mô, chỉ dựa trên chất lượng thực sự.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 rounded-2xl bg-[#00173a] p-6 text-white">
                    <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-[#bb0012]" />
                    <div>
                      <h3 className="mb-1 font-black">{item.title}</h3>
                      <p className="text-sm text-white/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-[#00173a] to-[#002c5c] p-10 text-white">
              <Heart className="h-10 w-10 shrink-0 text-[#bb0012]" />
              <div>
                <h3 className="mb-1 text-xl font-black">Cảm Ơn Bạn Đã Tin Tưởng</h3>
                <p className="text-white/70">
                  Mỗi lượt đọc, mỗi phản hồi đều là động lực để chúng tôi tiếp tục con đường này.
                </p>
              </div>
            </section>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
