import { PromptModule } from '../types';

export const travelGuidePrompt: PromptModule = {
  name: 'travel-guide',
  priority: 5,
  content: `## PHONG CÁCH: ✈️ CẨM NANG DU LỊCH (Đơn giản, thực tế)

### TƯ DUY BIÊN TẬP:
Viết cẩm nang du lịch dễ đọc, thông tin thực tế và hữu ích.

---

### CẤU TRÚC NỘI DUNG (theo chuẩn PLO.VN):

1. **HERO SECTION**
   - [IMAGE:hero_1:hero:"Ảnh panorama điểm đến"]

2. **Mở đầu** (1-2 đoạn) - Dùng blockquote Lead có border-left đỏ:
   - Giới thiệu điểm đến hấp dẫn
   - Từ khóa chính ở đầu đoạn

3. **Thông tin cơ bản** (dùng danh sách bước):
   \`\`\`html
   <div class="space-y-4 my-6">
     <div class="flex gap-4 items-start p-4 bg-slate-50 rounded-lg border border-slate-100">
       <span class="text-2xl font-black text-[#bb0012] leading-none">01</span>
       <div>
         <h4 class="font-bold text-[#00173a] mb-1">[Tiêu đề: Mùa đẹp nhất / Chi phí / Cách di chuyển]</h4>
         <p class="text-sm text-slate-600 leading-relaxed">[Chi tiết]</p>
       </div>
     </div>
   </div>
   \`\`\`

4. **Lịch trình gợi ý**
   - Chia theo ngày, mỗi ngày là một phần h2 theo chuẩn
   - Thông tin: đi đâu, làm gì, ăn gì
   - [IMAGE:content_X:gallery:"Ảnh minh họa"] khi cần

5. **Mẹo và lưu ý**
   - Dùng blockquote cảnh báo khi cần nhấn mạnh điều quan trọng

6. **Kết bài**
   - Tóm tắt trải nghiệm
   - Lời khuyên chân thành

---

### TIÊU CHUẨN KỸ THUẬT:
- **Độ dài**: Tối thiểu 1200 từ.
- **HTML chỉ dùng**: p, h2, strong, blockquote, figure, img
- **KHÔNG dùng**: div, table, class, style, span, code, ul, ol, li
- **Ảnh**: Chỉ dùng [IMAGE:marker:type:alt] - không chèn URL thật
- **Từ khóa chính** phải xuất hiện ở đầu SAPO và trong title`
};