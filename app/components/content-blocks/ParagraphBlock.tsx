interface ParagraphBlockProps {
  content: string;
}

export default function ParagraphBlock({ content }: ParagraphBlockProps) {
  // Handle basic markdown-like bold: **text**
  const html = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  return (
    <p
      className="text-lg text-slate-700 leading-loose mb-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}