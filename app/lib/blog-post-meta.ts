const LEGACY_PROVINCE_META_REGEX = /^<!--province:(.*?)-->\s*/i;
const BLOG_META_REGEX = /^<!--blog-meta:(.*?)-->\s*/is;

export type BlogContentMetadata = {
  province?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
};

function normalizeKeywords(value: unknown) {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const keywords: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') continue;
    const normalized = item.trim();
    if (!normalized) continue;

    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    keywords.push(normalized);
  }

  return keywords.slice(0, 12);
}

function normalizeMetadata(metadata: BlogContentMetadata | null | undefined): BlogContentMetadata {
  const normalizedProvince = metadata?.province?.trim();
  const normalizedMetaTitle = metadata?.metaTitle?.trim();
  const normalizedMetaDescription = metadata?.metaDescription?.trim();
  const normalizedKeywords = normalizeKeywords(metadata?.keywords);

  return {
    ...(normalizedProvince ? { province: normalizedProvince } : {}),
    ...(normalizedMetaTitle ? { metaTitle: normalizedMetaTitle } : {}),
    ...(normalizedMetaDescription ? { metaDescription: normalizedMetaDescription } : {}),
    ...(normalizedKeywords.length > 0 ? { keywords: normalizedKeywords } : {}),
  };
}

export function extractBlogContentMetadata(content: string | null | undefined): BlogContentMetadata {
  if (!content) return {};

  const metaMatch = content.match(BLOG_META_REGEX);
  if (metaMatch?.[1]) {
    try {
      const parsed = JSON.parse(metaMatch[1]);
      return normalizeMetadata(parsed);
    } catch {
      // Ignore invalid metadata and fall back to legacy province parsing.
    }
  }

  const legacyProvince = content.match(LEGACY_PROVINCE_META_REGEX)?.[1]?.trim();
  return legacyProvince ? { province: legacyProvince } : {};
}

export function extractProvinceFromContent(content: string | null | undefined) {
  return extractBlogContentMetadata(content).province || '';
}

export function stripBlogContentMetadata(content: string | null | undefined) {
  if (!content) return '';

  return content
    .replace(BLOG_META_REGEX, '')
    .replace(LEGACY_PROVINCE_META_REGEX, '')
    .trim();
}

export function injectBlogContentMetadata(content: string | null | undefined, metadata: BlogContentMetadata | null | undefined) {
  const cleanedContent = stripBlogContentMetadata(content);
  const normalizedMetadata = normalizeMetadata(metadata);

  if (Object.keys(normalizedMetadata).length === 0) {
    return cleanedContent;
  }

  return `<!--blog-meta:${JSON.stringify(normalizedMetadata)}-->\n${cleanedContent}`.trim();
}

export function injectProvinceIntoContent(content: string | null | undefined, province: string | null | undefined) {
  const currentMetadata = extractBlogContentMetadata(content);

  return injectBlogContentMetadata(content, {
    ...currentMetadata,
    province: province?.trim(),
  });
}
