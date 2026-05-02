import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Scale, FileText, AlertTriangle, Gavel, RefreshCw, Mail } from 'lucide-react';

export default function DieuKhoanSuDung() {
  return (
    <main className="min-h-screen bg-white">
      <Header showNewsTicker={true} activeLink="blog" />

      <article className="mx-auto max-w-screen-2xl px-8 pb-24 pt-40">
        <div className="mx-auto max-w-4xl">
          <header className="mb-16 space-y-6 border-b border-slate-100 pb-12">
            <span className="inline-block rounded-full bg-[#bb0012] px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Pháp Lý
            </span>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-[#00173a] md:text-7xl">
              Điều Khoản Sử Dụng
            </h1>
            <p className="text-xl font-medium leading-relaxed text-slate-500">
              Bằng việc truy cập và sử dụng Địa Điểm Hot, bạn đồng ý tuân thủ các điều khoản sau. Vui lòng đọc kỹ trước khi tiếp tục.
            </p>
            <p className="text-sm text-slate-400">
              Cập nhật lần cuối: 27 tháng 4 năm 2026
            </p>
          </header>

          <div className="prose prose-lg max-w-none space-y-16">
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <FileText className="h-6 w-6 text-[#bb0012]" />
                Giới Thiệu
              </h2>
              <p className="leading-relaxed text-slate-600">
                Địa Điểm Hot (diadiemhot.vn) là nền tảng đánh giá và giới thiệu địa điểm — nhà hàng, quán cà phê, spa, khách sạn và các địa điểm dịch vụ khác tại Việt Nam. Chúng tôi cung cấp nội dung đánh giá, xếp hạng và bài viết chuyên sâu dựa trên tiêu chuẩn biên tập nghiêm ngặt.
              </p>
              <p className="leading-relaxed text-slate-600">
                Khi truy cập hoặc sử dụng bất kỳ phần nào của nền tảng này, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản Sử dụng này. Nếu bạn không đồng ý, vui lòng không sử dụng nền tảng.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Scale className="h-6 w-6 text-[#bb0012]" />
                Quyền Sở Hữu Nội Dung
              </h2>
              <p className="leading-relaxed text-slate-600">
                Toàn bộ nội dung trên Địa Điểm Hot — bao gồm nhưng không giới hạn ở văn bản, hình ảnh, đồ họa, logo, biểu tượng, xếp hạng, điểm số và thiết kế — là tài sản của Địa Điểm Hot hoặc được cấp phép hợp lệ. Bạn không được sao chép, phân phối lại, tạo ra các tác phẩm phái sinh hoặc sử dụng cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản.
              </p>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#00173a]">
                  <FileText className="h-4 w-4" />
                  Nội dung được phép sử dụng
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Bạn có thể chia sẻ liên kết đến bài viết trên Địa Điểm Hot trên mạng xã hội hoặc tin nhắn cá nhân. Miễn là nội dung không bị thay đổi và có ghi nhận nguồn.
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <AlertTriangle className="h-6 w-6 text-[#bb0012]" />
                Giới Hạn Trách Nhiệm
              </h2>
              <p className="leading-relaxed text-slate-600">
                Nội dung trên Địa Điểm Hot được cung cấp <strong className="text-[#00173a]">"nguyên trạng"</strong> và chỉ mang tính chất tham khảo. Mặc dù chúng tôi nỗ lực đảm bảo tính chính xác và cập nhật, chúng tôi không đưa ra bảo đảm dưới bất kỳ hình thức nào về:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Tính đầy đủ, chính xác hoặc độ tin cậy của bất kỳ nội dung nào',
                  'Khả năng đáp ứng yêu cầu cụ thể của bạn',
                  'Tình trạng hoạt động liên tục của nền tảng không có lỗi kỹ thuật',
                  'Mức độ phù hợp của địa điểm được giới thiệu với kỳ vọng cá nhân',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#bb0012]" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
              <p className="leading-relaxed text-slate-600">
                Địa Điểm Hot không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp, gián tiếp, đặc biệt hoặc do hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng nền tảng này.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <FileText className="h-6 w-6 text-[#bb0012]" />
                Đánh Giá & Nội Dung Người Dùng
              </h2>
              <p className="leading-relaxed text-slate-600">
                Nếu Địa Điểm Hot cho phép người dùng đóng góp nội dung (đánh giá, bình luận, hình ảnh), bạn:
              </p>
              <div className="space-y-3">
                {[
                  { title: 'Chịu trách nhiệm về nội dung mình đăng', desc: 'Đảm bảo nội dung không vi phạm quyền của bên thứ ba, không mang tính phỉ báng, lừa đảo hoặc vi phạm pháp luật.' },
                  { title: 'Cấp quyền sử dụng cho Địa Điểm Hot', desc: 'Bạn cấp cho chúng tôi quyền sử dụng, chỉnh sửa và phân phối nội dung bạn đăng tải trên nền tảng.' },
                  { title: 'Tuân thủ tiêu chuẩn cộng đồng', desc: 'Không đăng nội dung rác, spam, quảng cáo hoặc nội dung không liên quan đến mục đích của nền tảng.' },
                  { title: 'Chấp nhận kiểm duyệt', desc: 'Chúng tôi có quyền gỡ bỏ nội dung không phù hợp mà không cần thông báo trước.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 rounded-xl border border-slate-100 p-5">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#bb0012]" />
                    <div>
                      <h3 className="font-bold text-[#00173a]">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Gavel className="h-6 w-6 text-[#bb0012]" />
                Quyền Của Doanh Nghiệp
              </h2>
              <p className="leading-relaxed text-slate-600">
                Nếu bạn là chủ sở hữu hoặc đại diện của một doanh nghiệp được đề cập trên Địa Điểm Hot:
              </p>
              <div className="space-y-3">
                {[
                  { title: 'Phản hồi đánh giá', desc: 'Bạn có quyền phản hồi bất kỳ đánh giá nào về địa điểm của mình để đưa ra góc nhìn từ phía doanh nghiệp.' },
                  { title: 'Yêu cầu hiệu chỉnh', desc: 'Nếu thông tin trên Địa Điểm Hot không chính xác, bạn có quyền yêu cầu chỉnh sửa qua email chính thức.' },
                  { title: 'Không bị ép xếp hạng', desc: 'Không doanh nghiệp nào có thể yêu cầu xóa đánh giá tiêu cực bằng cách trả phí. Xếp hạng chỉ phản ánh đánh giá độc lập.' },
                  { title: 'Giải quyết tranh chấp', desc: 'Mọi khiếu nại sẽ được xem xét công bằng dựa trên bằng chứng thực tế từ cả hai phía.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 rounded-xl border border-slate-100 p-5">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#bb0012]" />
                    <div>
                      <h3 className="font-bold text-[#00173a]">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <RefreshCw className="h-6 w-6 text-[#bb0012]" />
                Thay Đổi Điều Khoản
              </h2>
              <p className="leading-relaxed text-slate-600">
                Địa Điểm Hot có quyền sửa đổi các Điều khoản Sử dụng này bất kỳ lúc nào. Thay đổi sẽ có hiệu lực ngay khi được đăng tải trên trang này. Việc bạn tiếp tục sử dụng nền tảng sau khi thay đổi được đăng đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
              </p>
              <p className="leading-relaxed text-slate-600">
                Chúng tôi khuyến khích bạn xem lại trang này định kỳ để nắm bắt các thay đổi mới nhất.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Mail className="h-6 w-6 text-[#bb0012]" />
                Liên Hệ
              </h2>
              <p className="leading-relaxed text-slate-600">
                Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản Sử dụng này, vui lòng liên hệ:
              </p>
              <div className="rounded-2xl border border-slate-100 bg-[#00173a] p-6 text-white">
                <div className="mb-2 font-black">Email: anivia161@gmail.com</div>
                <div className="mb-2 text-sm text-white/70">Điện thoại: 0901.400.248</div>
                <p className="text-sm text-white/60">Chúng tôi sẽ phản hồi trong vòng 3 ngày làm việc.</p>
              </div>
            </section>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
