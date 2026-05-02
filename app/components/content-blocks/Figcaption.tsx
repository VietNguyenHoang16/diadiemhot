interface FigcaptionProps {
  text: string;
}

export default function Figcaption({ text }: FigcaptionProps) {
  return (
    <figcaption className="text-center text-sm font-semibold bg-white text-slate-500 p-2 italic border-b border-slate-100">
      {text}
    </figcaption>
  );
}