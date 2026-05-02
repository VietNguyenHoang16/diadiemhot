export type ContentBlock =
  | { type: 'dropcap'; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'blockquote'; content: string }
  | { type: 'image-grid'; urls: string[]; caption?: string }
  | { type: 'heading'; number: string; text: string }
  | { type: 'figcaption'; text: string }
  | { type: 'tag-list'; tags: string[] };

const BLOCK_REGEX = /:::(\w+)(?::([\s\S]*?))?:::/g;
const HEADING_REGEX = /^(##)\s*(\d+)\.\s*(.+)$/gm;

export function parseContentBlocks(content: string | null | undefined): ContentBlock[] {
  if (!content) return [];

  const blocks: ContentBlock[] = [];
  let remaining = content.trim();

  // Extract :::blocktype content ::: blocks first
  const blockMatches: { marker: string; inner: string; start: number; end: number }[] = [];
  let match;

  BLOCK_REGEX.lastIndex = 0;
  while ((match = BLOCK_REGEX.exec(content)) !== null) {
    blockMatches.push({
      marker: match[1],
      inner: (match[2] || '').trim(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  // Process content with blocks
  let lastEnd = 0;
  for (const bm of blockMatches) {
    // Add text before this block as paragraphs
    const textBefore = content.slice(lastEnd, bm.start).trim();
    if (textBefore) {
      const paragraphs = textBefore.split(/\n{2,}/).filter(Boolean);
      for (const p of paragraphs) {
        const trimmed = p.trim();
        if (!trimmed) continue;
        const headingMatch = /^##\s*(\d+)\.\s*(.+)$/.exec(trimmed);
        if (headingMatch) {
          blocks.push({ type: 'heading', number: headingMatch[1], text: headingMatch[2] });
        } else {
          blocks.push({ type: 'paragraph', content: trimmed.replace(/\n/g, '<br />') });
        }
      }
    }

    // Add the block
    switch (bm.marker) {
      case 'dropcap':
        blocks.push({ type: 'dropcap', content: bm.inner });
        break;
      case 'blockquote':
        blocks.push({ type: 'blockquote', content: bm.inner });
        break;
      case 'image-grid':
        const urls = bm.inner.split('|').map((u: string) => u.trim()).filter(Boolean);
        blocks.push({ type: 'image-grid', urls });
        break;
      case 'figcaption':
        blocks.push({ type: 'figcaption', text: bm.inner });
        break;
      case 'tags':
        const tags = bm.inner.split(',').map((t: string) => t.trim()).filter(Boolean);
        blocks.push({ type: 'tag-list', tags });
        break;
    }

    lastEnd = bm.end;
  }

  // Add remaining text after last block
  const textAfter = content.slice(lastEnd).trim();
  if (textAfter) {
    const paragraphs = textAfter.split(/\n{2,}/).filter(Boolean);
    for (const p of paragraphs) {
      const trimmed = p.trim();
      if (!trimmed) continue;
      const headingMatch = /^##\s*(\d+)\.\s*(.+)$/.exec(trimmed);
      if (headingMatch) {
        blocks.push({ type: 'heading', number: headingMatch[1], text: headingMatch[2] });
      } else {
        blocks.push({ type: 'paragraph', content: trimmed.replace(/\n/g, '<br />') });
      }
    }
  }

  return blocks;
}

export function extractPlainText(content: string | null | undefined): string {
  if (!content) return '';
  return content
    .replace(/:::\w+[\s\S]*?:::/g, ' ')
    .replace(/##\s*\d+\.\s*/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}

export function estimateReadingTime(content: string | null | undefined): number {
  const text = extractPlainText(content || '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}