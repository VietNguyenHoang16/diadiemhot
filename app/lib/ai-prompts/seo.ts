import { PromptModule, SeoScore } from './types';

export const seoPrompt: PromptModule = {
  name: 'seo',
  priority: 9,
  content: `## SEO CHECKLIST - LÀM ĐỦ ĐỂ ĐẠT 100 ĐIỂM

### BẮT BUỘC PHẢI CÓ:

#### 1. TITLE (15 điểm)
- Độ dài: 50-60 ký tự
- Chứa từ khóa chính
- Ví dụ: "Review Cà Phê Trứng Giảng Hà Nội – Địa Điểm Ngon 2026"

#### 2. EXCERPT/META DESCRIPTION (10 điểm)
- Độ dài: 150-160 ký tự
- Chứa từ khóa chính
- Có CTA: "Khám phá", "Xem ngay", "Đọc ngay"

#### 3. KEYWORD TRONG TITLE + FIRST 100 WORDS (25 điểm)
- Từ khóa chính phải có TRONG title
- Từ khóa chính phải có TRONG 100 từ đầu tiên

#### 4. HEADING STRUCTURE (15 điểm)
- Ít nhất 5 H2 headings
- Có H3 cho subsections
- Không skip heading levels

#### 5. FAQ SECTION (10 điểm)
- BẮT BUỘC có FAQ ở cuối bài
- 5 câu hỏi thường gặp
- Dùng format:
\`\`\`html
<div class="my-10 p-8 bg-slate-50 rounded-2xl border border-slate-200">
  <h2 class="text-xl font-black text-[#00173a] mb-6">❓ Câu Hỏi Thường Gặp</h2>
  <div class="space-y-4">
    <div class="border-b border-slate-200 pb-4">
      <p class="font-bold text-[#00173a] mb-2">Q: [Câu hỏi 1]?</p>
      <p class="text-slate-600">A: [Trả lời đầy đủ]</p>
    </div>
    <!-- ... thêm 4 câu nữa -->
  </div>
</div>
\`\`\`

#### 6. IMAGE MARKERS (10 điểm)
- Ít nhất 5 [IMAGE:...] markers
- Mỗi marker có description rõ ràng, liên quan chủ đề
- Đặt ngay sau mỗi H2 heading

#### 7. WORD COUNT (15 điểm)
- Tối thiểu 2300 từ (khuyên dùng 2500-3500 từ)

#### 8. MỖI ĐỊA ĐIỂM PHẢI CÓ ẢNH
- Mỗi địa điểm được nhắc đến trong bài phải có [IMAGE:...] marker riêng
- Ảnh minh họa cho địa điểm đó đặt ngay sau mô tả về địa điểm
- Địa chỉ và ảnh phải đi cùng nhau

#### 9. ẢNH PHẢI CÓ ALT VÀ CHÚ THÍCH
- Description trong [IMAGE:...] phải là alt text mô tả ảnh
- Thêm chú thích bằng <figcaption> bên dưới ảnh
- Format đầy đủ:
\`\`\`html
<figure>
  <img src="..." alt="Mô tả alt text cho ảnh" class="..." />
  <figcaption class="text-center text-sm text-gray-500 mt-2">Chú thích ngắn về ảnh này</figcaption>
</figure>
\`\`\`

#### 10. ẢNH TRONG BÀI PHẢI KHÁC NHAU
- Mỗi [IMAGE:...] marker phải có description KHÁC NHAU
- Không được dùng cùng một description cho 2 ảnh
- Ví dụ SAI: [IMAGE:1]:"Quán cà phê" và [IMAGE:2]:"Quán cà phê"
- Ví dụ ĐÚNG: [IMAGE:1]:"Quán cà phê mặt tiền đường Lê Lợi" và [IMAGE:2]:"Nội thất quán với bàn ghế gỗ"

#### 11. ĐỊA CHỈ CỤ THỂ
- Mỗi địa điểm được nhắc đến phải có địa chỉ cụ thể
- Format: "Tên địa điểm - Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành"
- Ví dụ: "Quán Cà Phê Giảng - 39 Lê Thị Hồng, Phường Bến Nghé, Quận 1, TP HCM"

### JSON OUTPUT FORMAT:
\`\`\`json
{
  "title": "Title 50-60 ký tự, chứa từ khóa chính",
  "excerpt": "Meta description 150-160 ký tự, chứa từ khóa, có CTA",
  "content": "<p>...</p><h2>...</h2><p>...</p>[IMAGE:...]<p>...</p>...<div>❓ Câu Hỏi Thường Gặp...</div>",
  "tags": ["tag1", "tag2", "tag3"],
  "targetKeywords": ["từ khóa chính", "từ khóa phụ"],
  "imageMarkers": [
    {"id": "hero_1", "type": "hero", "description": "Mô tả ảnh bìa liên quan chủ đề"},
    {"id": "content_1", "type": "content", "description": "Mô tả ảnh minh họa"},
    {"id": "content_2", "type": "content", "description": "Mô tả ảnh minh họa"},
    {"id": "content_3", "type": "content", "description": "Mô tả ảnh minh họa"},
    {"id": "content_4", "type": "content", "description": "Mô tả ảnh minh họa"}
  ]
}
\`\`\``
};

// Extract image markers from content
function extractImageMarkersFromContent(content: string): number {
  const markerRegex = /\[IMAGE:[^:]+:[^:]+:"[^"]+"\]/g;
  const markers = content.match(markerRegex);
  return markers ? markers.length : 0;
}

// Calculate SEO score from article data
export function calculateSeoScore(data: {
  title: string;
  excerpt: string;
  content: string;
  targetKeywords?: string[];
}): SeoScore {
  const factors = {
    keywordInTitle: false,
    keywordInFirst100Words: false,
    internalLinks: 0,
    imagesWithAlt: 0,
    headingStructure: false,
    metaDescription: false,
    faqSchema: false,
    imageMarkers: 0,
    wordCount: 0
  };

  const suggestions: string[] = [];
  const textContent = data.content.replace(/\[IMAGE:[^\]]+\]/g, '').replace(/<[^>]+>/g, ' ');

  // 1. Word count (15 points) - minimum 2300 words
  factors.wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
  if (factors.wordCount < 2300) {
    suggestions.push(`Bài viết ${factors.wordCount} từ. Cần tăng lên ít nhất 2300 từ.`);
  }

  // 2. Title length + keyword (15 points)
  if (data.title.length >= 50 && data.title.length <= 60) {
    if (data.targetKeywords && data.targetKeywords.length > 0) {
      const mainKeyword = data.targetKeywords[0].toLowerCase();
      factors.keywordInTitle = data.title.toLowerCase().includes(mainKeyword);
    } else {
      factors.keywordInTitle = true; // No keyword specified, just check length
    }
  } else {
    suggestions.push(`Title ${data.title.length} ký tự. Cần 50-60 ký tự.`);
  }

  // 3. Keyword in first 100 words (10 points)
  if (data.targetKeywords && data.targetKeywords.length > 0) {
    const mainKeyword = data.targetKeywords[0].toLowerCase();
    const first100 = textContent.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
    factors.keywordInFirst100Words = first100.includes(mainKeyword);
    if (!factors.keywordInFirst100Words) {
      suggestions.push(`Từ khóa chưa xuất hiện trong 100 từ đầu.`);
    }
  } else {
    factors.keywordInFirst100Words = true;
  }

  // 4. Meta description length (10 points)
  if (data.excerpt.length >= 150 && data.excerpt.length <= 160) {
    factors.metaDescription = true;
  } else {
    suggestions.push(`Excerpt ${data.excerpt.length} ký tự. Cần 150-160 ký tự.`);
  }

  // 5. Heading structure - at least 5 H2 (15 points)
  const h2Count = (data.content.match(/<h2/gi) || []).length;
  const h3Count = (data.content.match(/<h3/gi) || []).length;
  factors.headingStructure = h2Count >= 5;
  if (h2Count < 5) {
    suggestions.push(`Chỉ có ${h2Count} H2. Cần ít nhất 5 H2 headings.`);
  }

  // 6. FAQ section (10 points)
  factors.faqSchema = data.content.toLowerCase().includes('câu hỏi thường gặp') ||
                     data.content.toLowerCase().includes('❓ câu hỏi');
  if (!factors.faqSchema) {
    suggestions.push(`Thiếu FAQ section. Thêm phần Câu Hỏi Thường Gặp vào cuối bài.`);
  }

  // 7. Image markers - at least 5 (10 points)
  factors.imageMarkers = extractImageMarkersFromContent(data.content);
  if (factors.imageMarkers < 5) {
    suggestions.push(`Chỉ có ${factors.imageMarkers} ảnh. Cần ít nhất 5 [IMAGE:...] markers.`);
  }

  // Calculate total score
  let total = 0;
  total += factors.keywordInTitle ? 15 : 0;
  total += factors.keywordInFirst100Words ? 10 : 0;
  total += factors.metaDescription ? 10 : 0;
  total += factors.headingStructure ? 15 : 0;
  total += factors.faqSchema ? 10 : 0;
  total += factors.imageMarkers >= 5 ? 10 : Math.floor((factors.imageMarkers / 5) * 10);
  total += factors.wordCount >= 2300 ? 15 : Math.floor((factors.wordCount / 2300) * 15);
  total = Math.min(100, total);

  return {
    total,
    factors,
    suggestions
  };
}

// Get SEO color based on score
export function getSeoScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

export function getSeoScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-50';
  if (score >= 60) return 'bg-amber-50';
  return 'bg-red-50';
}
