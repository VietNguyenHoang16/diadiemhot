import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Shield, Lock, Eye, UserCheck, FileText, RefreshCw } from 'lucide-react';

export default function ChinhSachBaoMat() {
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
              Chính Sách Bảo Mật
            </h1>
            <p className="text-xl font-medium leading-relaxed text-slate-500">
              Địa Điểm Hot cam kết bảo vệ dữ liệu cá nhân của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin.
            </p>
            <p className="text-sm text-slate-400">
              Cập nhật lần cuối: 27 tháng 4 năm 2026
            </p>
          </header>

          <div className="prose prose-lg max-w-none space-y-16">
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Shield className="h-6 w-6 text-[#bb0012]" />
                Thông Tin Chúng Tôi Thu Thập
              </h2>
              <p className="leading-relaxed text-slate-600">
                Chúng tôi thu thập tối thiểu thông tin cần thiết để vận hành nền tảng và cung cấp dịch vụ cho bạn.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Thông tin khi đăng nhập', desc: 'Khi bạn đăng nhập qua Gmail, chúng tôi chỉ nhận tên và email cơ bản. Không có thông tin tài khoản mạng xã hội hay dữ liệu cá nhân nhạy cảm nào khác.' },
                  { title: 'Dữ liệu duyệt web', desc: 'Chúng tôi thu thập dữ liệu ẩn danh về cách bạn tương tác với nền tảng — trang nào được xem, thời gian đọc — nhằm cải thiện trải nghiệm người dùng.' },
                  { title: 'Cookies', desc: 'Sử dụng cookie để duy trì phiên đăng nhập và ghi nhớ tùy chọn của bạn. Bạn có thể tắt cookie trong trình duyệt nhưng một số tính năng có thể bị ảnh hưởng.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-100 p-6">
                    <h3 className="mb-2 font-black text-[#00173a]">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Lock className="h-6 w-6 text-[#bb0012]" />
                Cách Chúng Tôi Bảo Vệ Dữ Liệu
              </h2>
              <p className="leading-relaxed text-slate-600">
                Bảo mật dữ liệu là ưu tiên hàng đầu của Địa Điểm Hot. Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ thông tin của bạn.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { label: 'Mã hóa SSL/TLS', desc: 'Toàn bộ dữ liệu truyền tải giữa trình duyệt và máy chủ được mã hóa 256-bit.' },
                  { label: 'Xác thực OAuth 2.0', desc: 'Đăng nhập qua Google sử dụng giao thức OAuth — chúng tôi không lưu trữ mật khẩu.' },
                  { label: 'Hạn chế truy cập', desc: 'Chỉ nhân viên được ủy quyền mới có thể truy cập hệ thống, với đăng nhập được ghi log đầy đủ.' },
                  { label: 'Cập nhật bảo mật', desc: 'Hệ thống được cập nhật bảo mật định kỳ và theo dõi lỗ hổng mới nhất.' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00173a]">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold text-[#00173a]">{item.label}</h3>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <Eye className="h-6 w-6 text-[#bb0012]" />
                Quyền Của Bạn
              </h2>
              <p className="leading-relaxed text-slate-600">
                Bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình. Cụ thể:
              </p>
              <div className="space-y-3">
                {[
                  { title: 'Truy cập dữ liệu', desc: 'Bạn có thể yêu cầu xem toàn bộ dữ liệu cá nhân mà chúng tôi lưu trữ về bạn.' },
                  { title: 'Yêu cầu xóa dữ liệu', desc: 'Bạn có thể yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan bất kỳ lúc nào.' },
                  { title: 'Phản đối xử lý dữ liệu', desc: 'Bạn có quyền phản đối việc xử lý dữ liệu của mình cho các mục đích cụ thể.' },
                  { title: 'Rút lại consent', desc: 'Bạn có thể rút lại bất kỳ sự đồng ý nào đã cấp trước đó bất kỳ lúc nào.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 rounded-xl border border-slate-100 p-5">
                    <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#bb0012]" />
                    <div>
                      <h3 className="font-bold text-[#00173a]">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Để thực hiện bất kỳ quyền nào, vui lòng gửi email đến <strong className="text-[#00173a]">anivia161@gmail.com</strong> hoặc gọi <strong className="text-[#00173a]">0901.400.248</strong> với tiê đề "Yêu cầu Bảo Mật Dữ Liệu". Chúng tôi sẽ phản hồi trong vòng 72 giờ.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <FileText className="h-6 w-6 text-[#bb0012]" />
                Dữ Liệu Chúng Tôi Không Thu Thập
              </h2>
              <p className="leading-relaxed text-slate-600">
                Địa Điểm Hot <strong className="text-[#00173a]">không</strong> thu thập:
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  'Số điện thoại (trừ khi bạn chủ động cung cấp qua liên hệ)',
                  'Địa chỉ nhà riêng',
                  'Thông tin tài chính hoặc thẻ tín dụng',
                  'Dữ liệu sức khỏe',
                  'Nội dung tin nhắn riêng tư',
                  'Dữ liệu từ các trang web bên thứ ba bạn truy cập',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-[#bb0012]" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-[#00173a]">
                <RefreshCw className="h-6 w-6 text-[#bb0012]" />
                Thay Đổi Chính Sách
              </h2>
              <p className="leading-relaxed text-slate-600">
                Chúng tôi có thể cập nhật Chính sách Bảo mật này định kỳ. Mọi thay đổi sẽ được đăng trên trang này với ngày cập nhật mới ở đầu trang. Nếu thay đổi quan trọng, chúng tôi sẽ thông báo rõ ràng hơn, bao gồm qua email nếu cần thiết.
              </p>
              <p className="leading-relaxed text-slate-600">
                Việc bạn tiếp tục sử dụng nền tảng sau khi Chính sách được cập nhật đồng nghĩa với việc bạn chấp nhận các thay đổi đó.
              </p>
            </section>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
