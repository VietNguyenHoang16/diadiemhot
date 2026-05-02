interface ImageGridBlockProps {
  urls: string[];
  caption?: string;
}

export default function ImageGridBlock({ urls, caption }: ImageGridBlockProps) {
  if (!urls || urls.length === 0) return null;

  const gridClass = urls.length === 4
    ? 'grid-cols-2'
    : urls.length === 2
    ? 'grid-cols-2'
    : 'grid-cols-1';

  return (
    <figure className="my-10 border border-slate-200 p-2 bg-white shadow-sm">
      <div className={`grid ${gridClass} gap-4`}>
        {urls.slice(0, 4).map((url, i) => (
          <div key={i} className="aspect-square bg-slate-200 overflow-hidden">
            <img
              src={url.trim()}
              alt={`Image ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="text-center text-xs text-slate-500 mt-3 font-bold uppercase tracking-widest pb-1">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}