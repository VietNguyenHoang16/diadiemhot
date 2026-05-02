import { PromptModule } from '../types';

export const checkInPrompt: PromptModule = {
  name: 'check-in',
  priority: 5,
  content: `## PHONG CÁCH: 📸 CHECK-IN & VIBE

### TƯ DUY BIÊN TẬP:
Giới thiệu địa điểm tập trung vào góc chụp đẹp, ánh sáng và mẹo sống ảo.

---

### CẤU TRÚC NỘI DUNG (theo chuẩn PLO.VN):

1. **HERO SECTION**
   - [IMAGE:hero_1:hero:"Ảnh check-in đẹp nhất của địa điểm"]

2. **Mở đầu** (1-2 đoạn) - Dùng blockquote Lead:
   - Địa điểm có gì đặc biệt
   - Phong cách/phù hợp với ai
   - Từ khóa chính ở đầu đoạn

3. **Các góc chụp triệu view**
   - Mỗi góc là một phần với h2 theo chuẩn
   - [IMAGE:content_X:gallery:"Mô tả ảnh minh họa góc chụp đó"]

4. **Kết bài**
   - Kinh nghiệm thực tế
   - Lời khuyên ngắn

---

### QUY TẮC NGHIÊM NGẶT:
- **CHỉ dùng [IMAGE:marker:type:description]** cho ảnh - KHÔNG viết hướng dẫn chụp ảnh vào content
- **KHÔNG viết** "Góc chụp:", "Posing:", "Editing:", "CHECK-IN MASTERCLASS" hay bất kỳ photography tips nào vào content
- Content chỉ mô tả ĐỊA ĐIỂM, không mô tả cách CHỤP ẢNH
- Ảnh minh họa phải CÓ TRONG MARKER, không viết trong đoạn văn
- **Độ dài content**: Tối thiểu 800 từ
- **HTML chỉ dùng**: p, h2, strong, blockquote, figure, img
- **KHÔNG dùng**: div, table, class, style, span, code, ul, ol, li
- **Từ khóa chính** phải xuất hiện ở đầu SAPO và trong title`
};