import apexMark from "@/assets/brand/apex-mark.png";

// Apex Strata Consulting logo: the strata mark + a two-line wordmark as live text
// (so it can be recoloured for light/dark backgrounds). The full name matters:
// another, unrelated company trades as just "Apex Strata". Used by the nav, footer
// and admin pages.
const SIZES = {
  sm: { mark: "h-8", text: "text-lg", sub: "text-[0.6rem] tracking-[0.34em]" },
  md: { mark: "h-11 lg:h-12", text: "text-xl lg:text-2xl", sub: "text-[0.6rem] lg:text-[0.68rem] tracking-[0.36em]" },
  lg: { mark: "h-16", text: "text-4xl", sub: "text-sm tracking-[0.36em]" },
};

export default function Logo({
  size = "md",
  textClassName = "text-foreground",
}: {
  size?: keyof typeof SIZES;
  textClassName?: string;
}) {
  const s = SIZES[size];
  return (
    <span className="flex items-center gap-3">
      <img src={apexMark} alt="" aria-hidden="true" className={`${s.mark} w-auto shrink-0`} />
      <span className="flex flex-col gap-1.5">
        <span className={`whitespace-nowrap font-serif font-bold tracking-wide leading-none ${s.text} ${textClassName}`}>APEX STRATA</span>
        <span className={`font-sans font-semibold uppercase leading-none text-primary ${s.sub}`}>Consulting</span>
      </span>
    </span>
  );
}
