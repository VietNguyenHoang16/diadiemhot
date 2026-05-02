interface TagListProps {
  tags: string[];
}

export default function TagList({ tags }: TagListProps) {
  return (
    <div className="mt-12 flex flex-wrap gap-2 pt-6 border-t border-slate-200">
      <span className="text-xs font-black text-[#00173a] uppercase tracking-widest py-2 mr-2">Tags:</span>
      {tags.map((tag, i) => (
        <span
          key={i}
          className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-[#bb0012] hover:text-white transition-colors cursor-pointer"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}