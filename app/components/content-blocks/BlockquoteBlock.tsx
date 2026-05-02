import { MessageCircle } from 'lucide-react';

interface BlockquoteBlockProps {
  content: string;
}

export default function BlockquoteBlock({ content }: BlockquoteBlockProps) {
  return (
    <blockquote className="my-10 p-10 bg-[#00173a] text-white relative shadow-lg">
      <MessageCircle className="w-10 h-10 text-[#bb0012] mb-4 opacity-50" />
      <p className="text-xl md:text-2xl font-bold leading-snug italic tracking-wide relative z-10 m-0 text-white">
        &ldquo;{content}&rdquo;
      </p>
      <footer className="mt-6 text-white/50 font-black text-xs uppercase tracking-[0.2em] pt-4 border-t border-white/20">
        — Ghi chép
      </footer>
    </blockquote>
  );
}