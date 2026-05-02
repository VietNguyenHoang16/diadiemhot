import DropCapBlock from './DropCapBlock';
import BlockquoteBlock from './BlockquoteBlock';
import ImageGridBlock from './ImageGridBlock';
import SectionHeading from './SectionHeading';
import ParagraphBlock from './ParagraphBlock';
import Figcaption from './Figcaption';
import TagList from './TagList';
import { parseContentBlocks, estimateReadingTime, extractPlainText, type ContentBlock } from '@/app/lib/content-blocks';

interface ContentRendererProps {
  content: string | null | undefined;
}

export function renderContent(content: string | null | undefined): ContentBlock[] {
  return parseContentBlocks(content);
}

export function getReadingTime(content: string | null | undefined): number {
  return estimateReadingTime(content);
}

export { parseContentBlocks, estimateReadingTime, extractPlainText };
export type { ContentBlock };

export default function ContentRenderer({ content }: ContentRendererProps) {
  const blocks = parseContentBlocks(content);

  return (
    <div className="blog-content article-typography space-y-2">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'dropcap':
            return <DropCapBlock key={i} content={block.content} />;
          case 'paragraph':
            return <ParagraphBlock key={i} content={block.content} />;
          case 'blockquote':
            return <BlockquoteBlock key={i} content={block.content} />;
          case 'image-grid':
            return <ImageGridBlock key={i} urls={block.urls} caption={block.caption} />;
          case 'heading':
            return <SectionHeading key={i} number={block.number} text={block.text} />;
          case 'figcaption':
            return <Figcaption key={i} text={block.text} />;
          case 'tag-list':
            return <TagList key={i} tags={block.tags} />;
          default:
            return null;
        }
      })}
    </div>
  );
}