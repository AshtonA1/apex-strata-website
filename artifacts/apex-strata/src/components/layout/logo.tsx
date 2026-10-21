import apexMark from "@/assets/brand/apex-mark.png";

// Apex Strata logo: the strata mark + the wordmark as live text (so it can be
// recoloured for light/dark backgrounds). Used by the nav, footer and admin pages.
const SIZES = {
  sm: { mark: "h-5", text: "text-base" },
  md: { mark: "h-8", text: "text-xl" },
  lg: { mark: "h-12", text: "text-3xl" },
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
      <span className={`font-serif font-bold tracking-wide leading-none ${s.text} ${textClassName}`}>APEX STRATA</span>
    </span>
  );
}
