// AI Prompts System - Modular prompt builder
export * from './types';
export * from './base';
export * from './images';
export * from './seo';
export * from './validation';

// Template prompts
export { reviewPrompt } from './templates/review';
export { rankingPrompt } from './templates/ranking';
export { travelGuidePrompt } from './templates/travel-guide';
export { cultureStoryPrompt } from './templates/culture-story';
export { checkInPrompt } from './templates/check-in';
export { promotionPrompt } from './templates/promotion';

import { PromptModule, TemplateConfig, GenerateRequest } from './types';
import { basePrompt, tonePrompts } from './base';
import { reviewPrompt } from './templates/review';
import { rankingPrompt } from './templates/ranking';
import { travelGuidePrompt } from './templates/travel-guide';
import { cultureStoryPrompt } from './templates/culture-story';
import { checkInPrompt } from './templates/check-in';
import { promotionPrompt } from './templates/promotion';
import { imageMarkerPrompt } from './images';
import { seoPrompt } from './seo';

// Template configurations
export const templateConfigs: Record<string, TemplateConfig> = {
  review: {
    id: 'review',
    name: 'Review Địa Điểm',
    icon: '📝',
    description: 'Review chi tiết nhà hàng, quán cafe, spa, khách sạn với đánh giá EEAT cao',
    requiredModules: ['base', 'review', 'images'],
    optionalModules: ['seo', 'tone-expert', 'tone-casual']
  },
  ranking: {
    id: 'ranking',
    name: 'Viral Top List',
    icon: '🚀',
    description: 'Danh sách Top 5, 10 với cấu trúc Viral, đánh mạnh vào tâm lý người đọc',
    requiredModules: ['base', 'ranking', 'images'],
    optionalModules: ['seo', 'tone-viral']
  },
  'travel-guide': {
    id: 'travel-guide',
    name: 'Cẩm Nang Du Lịch',
    icon: '✈️',
    description: 'Lịch trình chi tiết theo ngày, chi phí, mẹo di chuyển và bí mật địa phương',
    requiredModules: ['base', 'travel-guide', 'images'],
    optionalModules: ['seo', 'tone-casual']
  },
  'culture-story': {
    id: 'culture-story',
    name: 'Câu Chuyện / Kể Chuyện',
    icon: '📖',
    description: 'Storytelling sâu sắc với mô hình Hero\'s Journey, giàu cảm xúc và giác quan',
    requiredModules: ['base', 'culture-story', 'images'],
    optionalModules: ['seo', 'tone-story']
  },
  'check-in': {
    id: 'check-in',
    name: 'Check-in & Vibe',
    icon: '📸',
    description: 'Tập trung vào góc chụp triệu view, ánh sáng và bí kíp sống ảo cực trendy',
    requiredModules: ['base', 'check-in', 'images'],
    optionalModules: ['seo', 'tone-viral', 'tone-casual']
  },
  promotion: {
    id: 'promotion',
    name: 'Quảng Cáo / PR',
    icon: '📢',
    description: 'Bài viết quảng bá đơn vị cụ thể - bài riêng hoặc Top 1 xếp hạng với điểm số vượt trội',
    requiredModules: ['base', 'promotion', 'images'],
    optionalModules: ['seo', 'tone-expert']
  }
};

// Get template prompt by ID
export function getTemplatePrompt(templateType: string): PromptModule {
  switch (templateType) {
    case 'review':
      return reviewPrompt;
    case 'ranking':
      return rankingPrompt;
    case 'travel-guide':
      return travelGuidePrompt;
    case 'culture-story':
      return cultureStoryPrompt;
    case 'check-in':
      return checkInPrompt;
    case 'promotion':
      return promotionPrompt;
    default:
      return reviewPrompt;
  }
}

// Build complete prompt from modules
export function buildPrompt(request: GenerateRequest): string {
  const modules: PromptModule[] = [];

  // Always add base
  modules.push(basePrompt);

  // Add tone if specified
  if (request.tone && tonePrompts[request.tone]) {
    modules.push(tonePrompts[request.tone]);
  }

  // Add template-specific prompt
  modules.push(getTemplatePrompt(request.templateType));

  // Add image marker instructions
  modules.push(imageMarkerPrompt);

  // Add SEO if requested
  if (request.includeStructuredData !== false) {
    modules.push(seoPrompt);
  }

  // Sort by priority
  modules.sort((a, b) => a.priority - b.priority);

  // Combine all modules
  let prompt = modules.map(m => m.content).join('\n\n');

  // Add user context
  prompt += `\n\n## USER INPUT:\n`;
  prompt += `Chủ đề: "${request.topic}"\n`;
  if (request.province) {
    prompt += `Khu vực: ${request.province}\n`;
  }

  // Extract main keyword from topic - AI must use this in title and first 100 words
  const mainKeyword = request.targetKeywords && request.targetKeywords.length > 0
    ? request.targetKeywords[0]
    : request.topic.split(' ').slice(0, 3).join(' ');
  prompt += `Từ khóa chính: ${mainKeyword}\n`;

  if (request.targetKeywords && request.targetKeywords.length > 1) {
    prompt += `Từ khóa phụ: ${request.targetKeywords.slice(1).join(', ')}\n`;
  }
  if (request.businessName) {
    prompt += `\nĐƠN VỊ QUẢNG CÁO / PR: ${request.businessName}\n`;
  }
  if (request.businessInfo) {
    prompt += `THÔNG TIN ĐƠN VỊ: ${request.businessInfo}\n`;
  }
  if (request.promotionMode) {
    const modeLabel = request.promotionMode === 'dedicated' ? 'BÀI VIẾT RIÊNG (100% về đơn vị này)' : 'TOP 1 XẾP HẠNG (đơn vị này đứng số 1, điểm cao hơn hẳn)';
    prompt += `CHẾ ĐỘ PR: ${modeLabel}\n`;
  }
  if (request.notes) {
    prompt += `\nHướng dẫn bổ sung: ${request.notes}\n`;
  }

  if (request.categories && request.categories.length > 0) {
    prompt += `\nDANH MỤC HỆ THỐNG: ${request.categories.join(', ')}\n`;
  }

  // Add final instruction
  prompt += `\n## YÊU CẦU CUỐI CÙNG:\n`;
  prompt += `1. Viết bài viết hoàn chỉnh theo tất cả các hướng dẫn trên\n`;
  prompt += `2. Trả về DUY NHẤT 1 JSON hợp lệ - không có text nào ngoài JSON\n`;
  prompt += `3. TỪ KHÓA CHÍNH phải xuất hiện trong title (đầu title) VÀ trong 100 từ đầu tiên của content\n`;
  prompt += `4. Sử dụng [IMAGE:id:type:"description"] cho tất cả vị trí cần ảnh - sẽ được thay bằng ảnh thật\n`;
  prompt += `5. KHÔNG VIẾT hướng dẫn chụp ảnh, mẹo chụp ảnh, posing, editing vào content\n`;
  prompt += `6. Content chỉ mô tả địa điểm - không mô tả cách chụp ảnh\n`;
  prompt += `7. TỐI THIỂU 2300 TỪ (khuyên dùng 2500-3500 từ)\n`;
  prompt += `8. ẢNH trong cùng 1 bài phải KHÁC NHAU - không dùng cùng description cho 2 ảnh\n`;
  prompt += `9. Mỗi địa điểm nhắc đến phải ghi rõ địa chỉ cụ thể (số nhà, đường, phường, quận, tỉnh)\n`;
  prompt += `10. NẾU tiêu đề có "Top N" (ví dụ Top 10, Top 5) → PHẢI liệt kê ĐỦ N địa điểm. Không được dừng ở N-4 hay bất kỳ số nào khác. Số thứ tự phải liên tục từ 1 đến N.\n`;
  prompt += `11. KHÔNG DÙNG blockquote. Mọi nội dung đều viết dưới dạng đoạn văn thường (thẻ p).\n`;
  prompt += `12. KHÔNG có phần "Góc nhìn chuyên gia" riêng. Nhận định chuyên gia (nếu có) viết chung vào đoạn văn thường.\n`;
  prompt += `13. KHÔNG tạo các đoạn trích dẫn với border màu đỏ.\n`;
  prompt += `14. KHÔNG đề cập số điện thoại khẩn cấp, đường dây nóng, hotline cứu hộ. KHÔNG tạo khung thông tin màu xanh đậm với biểu tượng điện thoại. Không cần thông tin liên hệ khẩn cấp trong bài.\n`;
  if (request.categories && request.categories.length > 0) {
    prompt += `15. CHỌN 1 danh mục phù hợp nhất từ DANH MỤC HỆ THỐNG được cung cấp ở trên và trả về trong field "category".\n`;
  } else {
    prompt += `15. Tự đề xuất 1 danh mục phù hợp (VD: Du lịch, Review, Ẩm thực) và trả về trong field "category".\n`;
  }

  return prompt;
}

// Parse AI response - handles various JSON formats
export function parseAIResponse(rawText: string): {
  title: string;
  excerpt: string;
  content: string;
  category?: string;
  tags: string[];
  targetKeywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  imageMarkers?: Array<{ id: string; type: string; description: string }>;
} | null {
  try {
    let jsonText = rawText.trim();

    // Strategy 1: Extract from code blocks
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }

    // Strategy 2: Try direct JSON parse
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.title && parsed.content) {
        return normalizeParsedResponse(parsed);
      }
    } catch { /* continue */ }

    // Strategy 3: Try to find JSON object using brace matching
    const braceResult = extractJsonObject(jsonText);
    if (braceResult) {
      try {
        const parsed = JSON.parse(braceResult);
        if (parsed.title && parsed.content) {
          return normalizeParsedResponse(parsed);
        }
      } catch { /* continue */ }
    }

    // Strategy 4: Try to extract key fields using regex (last resort for truncated JSON)
    const titleMatch = jsonText.match(/"title"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    const contentMatch = jsonText.match(/"content"\s*:\s*"([\s\S]*?)"(?:\s*,|\s*\}|$)/);

    if (titleMatch && contentMatch?.[1]?.trim()) {
      console.warn('[parseAIResponse] Used fallback - title found, content may be truncated');
      return {
        title: titleMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
        excerpt: '',
        content: contentMatch ? contentMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : '',
        tags: [],
        targetKeywords: [],
        imageMarkers: []
      };
    }

    console.error('[parseAIResponse] All strategies failed. Raw text preview:', jsonText.slice(0, 500));
    return null;
  } catch (e) {
    console.error('[parseAIResponse] Parse error:', e, 'Raw:', rawText.slice(0, 300));
    return null;
  }
}

function extractJsonObject(text: string): string | null {
  let startIdx = text.indexOf('{');
  if (startIdx === -1) return null;

  let depth = 0;
  let endIdx = -1;
  let inString = false;
  let escaped = false;

  for (let i = startIdx; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"' && !escaped) {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') depth++;
    else if (char === '}') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (endIdx === -1) return null;
  return text.substring(startIdx, endIdx + 1);
}

function normalizeParsedResponse(parsed: any): {
  title: string;
  excerpt: string;
  content: string;
  category?: string;
  tags: string[];
  targetKeywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  imageMarkers?: Array<{ id: string; type: string; description: string }>;
} {
  return {
    title: parsed.title || '',
    excerpt: parsed.excerpt || parsed.metaDescription || '',
    content: parsed.content || '',
    category: parsed.category,
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 10) : [],
    targetKeywords: parsed.targetKeywords,
    metaTitle: parsed.metaTitle,
    metaDescription: parsed.metaDescription,
    imageMarkers: parsed.imageMarkers
  };
}

// Sanitize HTML content
export function sanitizeHtml(html: string): string {
  // Remove dangerous tags
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/<input[^>]*>/gi, '')
    .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
    .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    // Remove self-closing void elements: img, br, hr — these leak raw markup into text
    .replace(/<img\b[^>]*\/?>/gi, '')
    .replace(/<br\b[^>]*\/?>/gi, '')
    .replace(/<hr\b[^>]*\/?>/gi, '');

  // Remove event handlers
  clean = clean
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+on\w+\s*=\s*\S+/gi, '');

  // Remove javascript URLs
  clean = clean
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""')
    .replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""');

  return clean.trim();
}
