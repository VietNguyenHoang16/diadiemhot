interface SectionHeadingProps {
  number: string;
  text: string;
}

export default function SectionHeading({ number, text }: SectionHeadingProps) {
  return (
    <h2 className="text-2xl md:text-3xl font-black text-[#00173a] uppercase tracking-tighter mt-12 mb-6 flex items-center">
      <span className="text-[#bb0012] mr-3">{number}.</span>
      {text}
    </h2>
  );
}