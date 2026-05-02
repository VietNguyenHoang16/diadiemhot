interface DropCapBlockProps {
  content: string;
}

export default function DropCapBlock({ content }: DropCapBlockProps) {
  const firstChar = content.charAt(0);
  const rest = content.slice(1);

  return (
    <p className="text-xl md:text-2xl text-[#00173a] font-medium leading-[1.6] mb-8 border-l-4 border-[#bb0012] pl-6 bg-slate-50 py-6 pr-4 shadow-sm">
      <span className="float-left text-5xl md:text-6xl font-black text-[#bb0012] mr-3 leading-none mt-1 uppercase">
        {firstChar}
      </span>
      {rest}
    </p>
  );
}