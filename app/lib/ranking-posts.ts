export const RANKING_CATEGORY = 'Xếp Hạng';

const RANKING_TITLE_KEYWORDS = [
  'top',
  'xếp hạng',
  'tốt nhất',
  'hay nhất',
  'đáng đi nhất',
  'đứng đầu',
];

function normalizeVietnameseText(value?: string | null) {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function isRankingCategory(category?: string | null) {
  return normalizeVietnameseText(category) === normalizeVietnameseText(RANKING_CATEGORY);
}

export function looksLikeRankingPostTitle(title?: string | null) {
  const normalizedTitle = normalizeVietnameseText(title);
  return RANKING_TITLE_KEYWORDS.some((keyword) =>
    normalizedTitle.includes(normalizeVietnameseText(keyword))
  );
}
