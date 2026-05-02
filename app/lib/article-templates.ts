// Article Template System - 4 built-in formulas
// Each template defines structure, sections, and default content

export type TemplateSection = {
  id: string;
  type: 'hero' | 'lead' | 'heading' | 'paragraph' | 'image' | 'gallery' | 'blockquote' | 'place-card' | 'tips-list' | 'pros-cons' | 'info-box' | 'rating-box' | 'comparison-table' | 'timeline' | 'cost-table' | 'native-ad' | 'cta-banner';
  label: string;
  placeholder?: string;
  required?: boolean;
};

export type ArticleTemplate = {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  sections: TemplateSection[];
  seoTips: string[];
};

export const articleTemplates: ArticleTemplate[] = [
  // ===== TEMPLATE 1: REVIEW ĐỊA ĐIỂM =====
  {
    id: 'review',
    name: 'Review Địa Điểm',
    icon: '📝',
    description: 'Dành cho review nhà hàng, quán cà phê, spa, khách sạn. Tập trung vào trải nghiệm thực tế và đánh giá chi tiết.',
    color: '#bb0012',
    sections: [
      { id: 'hero', type: 'hero', label: 'Ảnh bìa + Tên địa điểm', required: true },
      { id: 'info-box', type: 'info-box', label: 'Thông tin nhanh (Địa chỉ, Giá, Giờ mở cửa, Đánh giá)', required: true },
      { id: 'lead', type: 'lead', label: 'Mở đầu - Ấn tượng đầu tiên', placeholder: 'Mô tả trải nghiệm đầu tiên khi bước vào địa điểm...', required: true },
      { id: 'h2-1', type: 'heading', label: '01. Không Gian & Thiết Kế' },
      { id: 'p-1', type: 'paragraph', label: 'Mô tả không gian', placeholder: 'Chi tiết về nội thất, ánh sáng, bầu không khí...' },
      { id: 'gallery-1', type: 'gallery', label: 'Gallery ảnh không gian (2-4 ảnh)' },
      { id: 'h2-2', type: 'heading', label: '02. Thực Đơn & Chất Lượng' },
      { id: 'p-2', type: 'paragraph', label: 'Đánh giá món ăn/dịch vụ', placeholder: 'Chi tiết về món đã thử, hương vị, trình bày...' },
      { id: 'img-food', type: 'image', label: 'Ảnh món ăn/dịch vụ nổi bật' },
      { id: 'native-ad', type: 'native-ad', label: '📢 Bài viết tài trợ (chèn giữa bài)' },
      { id: 'h2-3', type: 'heading', label: '03. Giá Cả & Phục Vụ' },
      { id: 'p-3', type: 'paragraph', label: 'Nhận xét về giá và nhân viên' },
      { id: 'pros-cons', type: 'pros-cons', label: 'Ưu điểm / Nhược điểm', required: true },
      { id: 'rating-box', type: 'rating-box', label: 'Bảng điểm tổng kết (Không gian, Chất lượng, Giá cả, Phục vụ)', required: true },
      { id: 'cta', type: 'cta-banner', label: 'CTA: "Bạn đã đến đây chưa? Gửi review!"' },
    ],
    seoTips: [
      'Tiêu đề nên chứa: Tên địa điểm + Khu vực/Thành phố',
      'Meta description: Tóm tắt 1-2 câu về trải nghiệm + điểm nổi bật',
      'Sử dụng schema LocalBusiness trong JSON-LD',
      'Alt text ảnh: mô tả cụ thể món ăn/không gian',
      'Thêm Google Maps embed nếu có',
    ],
  },

  // ===== TEMPLATE 2: VIRAL TOP LIST =====
  {
    id: 'ranking',
    name: 'Viral Top List',
    icon: '🚀',
    description: 'Danh sách Top 5, 10 với cấu trúc Viral, đánh mạnh vào tâm lý người đọc và sự tò mò tột độ.',
    color: '#f59e0b',
    sections: [
      { id: 'hero', type: 'hero', label: 'Ảnh bìa + Tiêu đề "Top X..."', required: true },
      { id: 'lead', type: 'lead', label: 'Giới thiệu + Tiêu chí xếp hạng', placeholder: 'Giải giải tại sao nơi này lại đứng đầu bảng xếp hạng...', required: true },
      { id: 'h2-1', type: 'heading', label: '#1 - [Tên địa điểm]' },
      { id: 'place-1', type: 'place-card', label: 'Card địa điểm #1 (chi tiết kỹ thuật, rating, vibe)' },
      { id: 'p-1', type: 'paragraph', label: 'Nhận xét chi tiết về #1' },
      { id: 'h2-2', type: 'heading', label: '#2 - [Tên địa điểm]' },
      { id: 'place-2', type: 'place-card', label: 'Card địa điểm #2' },
      { id: 'p-2', type: 'paragraph', label: 'Nhận xét ngắn về #2' },
      { id: 'h2-3', type: 'heading', label: '#3 - [Tên địa điểm]' },
      { id: 'place-3', type: 'place-card', label: 'Card địa điểm #3' },
      { id: 'p-3', type: 'paragraph', label: 'Nhận xét ngắn về #3' },
      { id: 'native-ad', type: 'native-ad', label: '📢 Bài viết tài trợ (sau item #3)' },
      { id: 'h2-more', type: 'heading', label: '#4, #5... (tiếp tục)' },
      { id: 'comparison', type: 'comparison-table', label: 'Bảng so sánh tổng hợp tất cả địa điểm', required: true },
      { id: 'conclusion', type: 'paragraph', label: 'Kết luận + Gợi ý cá nhân' },
      { id: 'cta', type: 'cta-banner', label: 'CTA: "Bạn đã thử chưa? Để lại review!"' },
    ],
    seoTips: [
      'Tiêu đề: "Top X + [Loại hình] + [Đặc điểm] + [Khu vực] + [Năm]"',
      'Ví dụ: "Top 10 Quán Cà Phê Đẹp Nhất Sài Gòn 2026"',
      'Sử dụng schema ItemList trong JSON-LD',
      'Mỗi item trong list nên có H2 riêng với số thứ tự',
      'Bảng so sánh giúp tăng Featured Snippet trên Google',
    ],
  },

  // ===== TEMPLATE 3: HƯỚNG DẪN DU LỊCH =====
  {
    id: 'travel-guide',
    name: 'Hướng Dẫn Du Lịch',
    icon: '✈️',
    description: 'Guide du lịch chi tiết theo ngày, bao gồm lịch trình, chi phí và mẹo di chuyển.',
    color: '#06b6d4',
    sections: [
      { id: 'hero', type: 'hero', label: 'Ảnh panorama điểm đến + Tiêu đề', required: true },
      { id: 'info-box', type: 'info-box', label: 'Tóm tắt chuyến đi (Thời gian, Chi phí, Mùa tốt nhất, Phương tiện)', required: true },
      { id: 'lead', type: 'lead', label: 'Giới thiệu điểm đến', placeholder: 'Tại sao nên đến đây? Điều gì đặc biệt?', required: true },
      { id: 'h2-day1', type: 'heading', label: 'Ngày 1: [Chủ đề]' },
      { id: 'timeline-1', type: 'timeline', label: 'Lịch trình Ngày 1 (sáng, trưa, chiều, tối)' },
      { id: 'gallery-1', type: 'gallery', label: 'Ảnh Ngày 1' },
      { id: 'h2-day2', type: 'heading', label: 'Ngày 2: [Chủ đề]' },
      { id: 'timeline-2', type: 'timeline', label: 'Lịch trình Ngày 2' },
      { id: 'gallery-2', type: 'gallery', label: 'Ảnh Ngày 2' },
      { id: 'native-ad', type: 'native-ad', label: '📢 Bài viết tài trợ' },
      { id: 'h2-tips', type: 'heading', label: 'Tips & Mẹo Di Chuyển' },
      { id: 'tips', type: 'tips-list', label: 'Danh sách mẹo (5-8 mẹo)' },
      { id: 'cost-table', type: 'cost-table', label: 'Bảng chi phí tổng kết', required: true },
      { id: 'cta', type: 'cta-banner', label: 'CTA: "Đặt tour" hoặc "Xem khách sạn gần đây"' },
    ],
    seoTips: [
      'Tiêu đề: "[Điểm đến] + [Số ngày] + Kinh Nghiệm/Hướng Dẫn + [Năm]"',
      'Ví dụ: "Du Lịch Đà Nẵng 3 Ngày 2 Đêm – Kinh Nghiệm Chi Tiết 2026"',
      'Sử dụng schema TravelAction hoặc TouristTrip',
      'Bảng chi phí rất có giá trị SEO – Google thường hiển thị làm Featured Snippet',
      'Thêm FAQ schema cho các câu hỏi thường gặp',
    ],
  },

  // ===== TEMPLATE 4: CÂU CHUYỆN VĂN HÓA =====
  {
    id: 'culture-story',
    name: 'Câu Chuyện Văn Hóa',
    icon: '📖',
    description: 'Bài viết dài, storytelling sâu sắc về văn hóa, ẩm thực, lịch sử. Tạo giá trị nội dung cao và backlink tự nhiên.',
    color: '#8b5cf6',
    sections: [
      { id: 'hero', type: 'hero', label: 'Ảnh cinematic + Tiêu đề gợi cảm xúc', required: true },
      { id: 'lead', type: 'lead', label: 'Mở đầu (Drop cap, storytelling)', placeholder: 'Dẫn dắt người đọc vào câu chuyện bằng một hình ảnh, khoảnh khắc cụ thể...', required: true },
      { id: 'h2-1', type: 'heading', label: '01. [Chương 1 - Nguồn gốc / Bối cảnh]' },
      { id: 'p-1', type: 'paragraph', label: 'Nội dung chương 1' },
      { id: 'img-1', type: 'image', label: 'Ảnh minh họa chương 1' },
      { id: 'h2-2', type: 'heading', label: '02. [Chương 2 - Diễn biến / Phát triển]' },
      { id: 'quote', type: 'blockquote', label: 'Trích dẫn nổi bật (lời người trong cuộc, sách, báo...)' },
      { id: 'p-2', type: 'paragraph', label: 'Nội dung chương 2' },
      { id: 'gallery', type: 'gallery', label: 'Gallery ảnh (2 cột)' },
      { id: 'native-ad', type: 'native-ad', label: '📢 Bài viết tài trợ' },
      { id: 'h2-3', type: 'heading', label: '03. [Chương 3 - Địa chỉ / Trải nghiệm thực tế]' },
      { id: 'places', type: 'place-card', label: 'Card địa điểm liên quan (2-3 nơi)' },
      { id: 'h2-4', type: 'heading', label: '04. [Chương 4 - Mẹo / Hướng dẫn]' },
      { id: 'tips', type: 'tips-list', label: 'Mẹo thưởng thức / trải nghiệm' },
      { id: 'closing', type: 'paragraph', label: 'Kết bài cảm xúc, suy ngẫm' },
      { id: 'cta', type: 'cta-banner', label: 'CTA: "Khám phá thêm câu chuyện văn hóa"' },
    ],
    seoTips: [
      'Tiêu đề: Dùng cảm xúc, không cần số liệu. Ví dụ: "Hành Trình 80 Năm Của..."',
      'Bài viết dài (1500+ từ) giúp tăng thời gian ở trang (dwell time)',
      'Sử dụng schema Article + Person author có profile',
      'Blockquote tốt cho SEO vì Google đánh giá cao nội dung có trích nguồn',
      'Nội dung unique, sâu sắc = backlink tự nhiên từ các trang khác',
    ],
  },
];

export function getTemplateById(id: string): ArticleTemplate | undefined {
  return articleTemplates.find(t => t.id === id);
}
