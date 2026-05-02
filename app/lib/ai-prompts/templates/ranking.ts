import { PromptModule } from '../types';

export const rankingPrompt: PromptModule = {
  name: 'ranking',
  priority: 5,
  content: `## PHONG CÁCH: VIRAL TOP LIST (Danh sách đơn giản)

### TƯ DUY BIÊN TẬP:
Viết danh sách top N địa điểm với tiêu đề hấp dẫn, mỗi địa điểm có mô tả ngắn gọn và ảnh minh họa.

---

### CẤU TRÚC NỘI DUNG (theo chuẩn PLO.VN):

1. **HERO SECTION**
   - [IMAGE:hero_1:hero:"Ảnh collage các địa điểm trong danh sách"]

2. **Mở đầu** (1-2 đoạn) - Dùng blockquote Lead:
   - Tại sao danh sách này đáng đọc
   - Tiêu chí lựa chọn
   - Từ khóa chính ở đầu đoạn

3. **DANH SÁCH XẾP HẠNG** - Theo chuẩn:
   \`\`\`html
   <h2 class="text-xl md:text-2xl font-black text-[#00173a] uppercase tracking-tight mt-10 mb-4 pb-2 border-b-2 border-[#bb0012]">
     01. Tên địa điểm - Địa chỉ
   </h2>
   <p>...[2-3 đoạn mô tả]...</p>
   [IMAGE:place_1:space:"Ảnh địa điểm"]
   \`\`\`
   - Thông tin cơ bản: địa chỉ, giá tham khảo, giờ mở cửa
   - Dùng <strong> để nhấn từ khóa

4. **Kết bài**
   - Gợi ý chọn theo nhu cầu (hẹn hò, tụ tập bạn bè,...)
   - CTA ngắn

---

### TIÊU CHUẨN KỸ THUẬT:
- **Độ dài**: Tối thiểu 1200 từ.
- **HTML chỉ dùng**: p, h2, strong, blockquote, figure, img
- **KHÔNG dùng**: div, table, class, style, span, code, ul, ol, li
- **Ảnh**: Chỉ dùng [IMAGE:marker:type:alt] - không chèn URL thật

### QUY TẮC BẮT BUỘC:
- **ĐỦ SỐ LƯỢNG**: Nếu user yêu cầu "Top 10" -> phải liệt kê ĐỦ 10 địa điểm. Không được dừng giữa chừng.
- **Mỗi địa điểm phải có**: tên, địa chỉ cụ thể (số nhà, đường, phường, quận), giá tham khảo, mô tả ít nhất 2 đoạn.
- **Số thứ tự phải liên tục**: 1, 2, 3, ... N. Không bỏ số, không nhảy số.
- **Từ khóa chính** phải xuất hiện ở đầu SAPO và trong title`
};
