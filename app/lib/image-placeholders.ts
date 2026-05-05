const PLACEHOLDER_ICON_BY_TYPE: Record<string, string> = {
  hero: '🖼️',
  content: '🖼️',
  gallery: '🖼️',
  food: '🍽️',
  space: '🏠',
  person: '👤',
  product: '📦',
};

const PLACEHOLDER_LABEL_BY_TYPE: Record<string, string> = {
  hero: 'Ảnh bìa',
  content: 'Ảnh nội dung',
  gallery: 'Ảnh gallery',
  food: 'Ảnh món ăn',
  space: 'Ảnh không gian',
  person: 'Ảnh người',
  product: 'Ảnh sản phẩm',
};

function escapeHtmlAttr(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripHtmlTags(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferPlaceholderType(classNames: string) {
  if (/aspect-\[21\/9\]/i.test(classNames)) return 'hero';
  if (/aspect-\[4\/3\]/i.test(classNames)) return 'food';
  if (/aspect-\[3\/4\]/i.test(classNames)) return 'person';
  if (/aspect-square/i.test(classNames)) return 'gallery';
  return 'content';
}

function shortenCaption(value: string) {
  const words = value.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const caption = words.slice(0, 8).join(' ');
  return caption.length > 60 ? `${caption.slice(0, 57).trim()}...` : caption;
}

export function createImagePlaceholderHtml(id: string, type: string, description: string) {
  const cleanDesc = shortenCaption(description);
  const icon = PLACEHOLDER_ICON_BY_TYPE[type] || PLACEHOLDER_ICON_BY_TYPE.content;
  const label = PLACEHOLDER_LABEL_BY_TYPE[type] || 'Ảnh';
  const displayDesc = cleanDesc.length > 60 ? `${cleanDesc.slice(0, 57)}...` : cleanDesc;

  const svgContent = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" xmlns:xlink="http://www.w3.org/1999/xlink">
      <rect fill="#f8fafc" width="800" height="400"/>
      <rect fill="none" stroke="#94a3b8" stroke-width="3" stroke-dasharray="12,8" width="796" height="396" x="2" y="2" rx="12"/>
      <text x="400" y="130" text-anchor="middle" font-size="80">${icon}</text>
      <text x="400" y="190" text-anchor="middle" font-size="28" font-weight="bold" fill="#475569" letter-spacing="2">${label.toUpperCase()}</text>
      <text x="400" y="235" text-anchor="middle" font-size="20" fill="#94a3b8" font-style="italic">${displayDesc}</text>
      <rect x="310" y="270" width="180" height="36" rx="8" fill="#8b5cf6" opacity="0.9"/>
      <text x="400" y="295" text-anchor="middle" font-size="16" fill="white" font-weight="bold">Click + Ctrl+V</text>
    </svg>`);

  return `<img src="data:image/svg+xml,${svgContent}" alt="${escapeHtmlAttr(cleanDesc)}" data-placeholder="true" data-marker-id="${escapeHtmlAttr(id)}" data-marker-type="${escapeHtmlAttr(type)}" data-caption="${escapeHtmlAttr(cleanDesc)}" data-icon="${escapeHtmlAttr(icon)}" data-label="${escapeHtmlAttr(label)}" class="cms-image-placeholder" loading="lazy" />`;
}

export function normalizeLegacyFigurePlaceholders(content: string | null | undefined) {
  if (!content) return '';

  let placeholderIndex = 0;

  return content.replace(/<figure\b([^>]*)>\s*<div\b([^>]*)>\s*<\/div>\s*<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>\s*<\/figure>/gi, (match, figureAttrs, divAttrs, captionHtml) => {
    if (/<img\b/i.test(match)) {
      return match;
    }

    const figureClassMatch = /class=(["'])(.*?)\1/i.exec(figureAttrs);
    const divClassMatch = /class=(["'])(.*?)\1/i.exec(divAttrs);
    const classNames = `${figureClassMatch?.[2] || ''} ${divClassMatch?.[2] || ''}`.trim();

    if (!/(bg-slate-200|aspect-\[|aspect-square)/i.test(classNames)) {
      return match;
    }

    const caption = stripHtmlTags(captionHtml);
    if (!caption) {
      return match;
    }

    placeholderIndex += 1;
    return createImagePlaceholderHtml(`legacy_${placeholderIndex}`, inferPlaceholderType(classNames), caption);
  });
}
