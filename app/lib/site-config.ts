export const SITE_NAME = 'Địa Điểm Hot';
export const SITE_TITLE = 'Khám Phá Địa Điểm, Review Và Cẩm Nang Du Lịch';
export const SITE_DESCRIPTION = 'Địa Điểm Hot chia sẻ review địa điểm, cẩm nang du lịch, danh sách xếp hạng và trải nghiệm thực tế để người đọc tìm nơi đáng đi nhanh hơn.';
export const SITE_AUTHOR = 'Ban biên tập Địa Điểm Hot';
export const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop';

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

export function getAbsoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function stripHtml(html: string | null | undefined) {
  if (!html) return '';

  return html
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;

  const shortened = value.slice(0, maxLength + 1);
  const cutIndex = shortened.lastIndexOf(' ');
  const safeValue = cutIndex > Math.floor(maxLength * 0.6)
    ? shortened.slice(0, cutIndex)
    : value.slice(0, maxLength);

  return `${safeValue.trim()}...`;
}

export function buildDescription(excerpt: string | null | undefined, content: string | null | undefined, fallback: string) {
  const cleanExcerpt = excerpt?.trim();
  if (cleanExcerpt) return truncateText(cleanExcerpt, 160);

  const plainContent = stripHtml(content);
  if (plainContent) return truncateText(plainContent, 160);

  return truncateText(fallback.trim(), 160);
}

export function toAbsoluteImageUrl(image: string | null | undefined) {
  if (!image) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  return getAbsoluteUrl(image.startsWith('/') ? image : `/${image}`);
}

export function uniqKeywords(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!value) continue;
    const normalized = value.trim();
    if (!normalized) continue;

    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(normalized);
  }

  return result;
}

export function extractFaqFromHtml(content: string | null | undefined) {
  if (!content) return [];

  const faqSectionMatch = content.match(/<h[2-4][^>]*>\s*(?:câu hỏi thường gặp|faq)\s*<\/h[2-4]>([\s\S]*)$/i);
  if (!faqSectionMatch?.[1]) return [];

  const faqHtml = faqSectionMatch[1];
  const items: Array<{ question: string; answer: string }> = [];
  const headingRegex = /<h[3-6][^>]*>([\s\S]*?)<\/h[3-6]>([\s\S]*?)(?=<h[3-6][^>]*>|$)/gi;

  for (const match of faqHtml.matchAll(headingRegex)) {
    const question = stripHtml(match[1]);
    const answer = truncateText(stripHtml(match[2]), 500);

    if (!question || !answer) continue;
    if (!question.includes('?') && question.length < 10) continue;

    items.push({ question, answer });
    if (items.length >= 6) break;
  }

  return items;
}
