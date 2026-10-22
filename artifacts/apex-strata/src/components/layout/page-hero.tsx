import { motion } from "framer-motion";
import rockTexture from "@/assets/images/rock-texture.png";

export default function PageHero({ eyebrow, title, subtitle, image, imageAlt = "" }: { eyebrow: string; title: string; subtitle?: string; image?: string; imageAlt?: string }) {
  return (
    <section className="relative pt-40 pb-20 md:pt-48 md:pb-28 bg-secondary text-secondary-foreground overflow-hidden">
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
        <img src={rockTexture} alt="" className="w-full h-full object-cover" />
      </div>
      {image && (
        <img
          src={image}
          alt={imageAlt}
          className="hidden lg:block absolute right-10 xl:right-24 top-1/2 -translate-y-1/2 w-[30rem] xl:w-[34rem] max-h-[85%] object-contain opacity-90 pointer-events-none select-none"
        />
      )}
      <div className="container relative z-10 mx-auto px-4 md:px-8">
        <motion.div className={image ? "lg:max-w-[52%]" : ""} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[2px] w-12 bg-primary"></div>
            <span className="text-primary font-bold uppercase tracking-widest text-sm">{eyebrow}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">{title}</h1>
          {subtitle && <p className="text-lg text-secondary-foreground/80 max-w-2xl">{subtitle}</p>}
        </motion.div>
      </div>
    </section>
  );
}
