import { motion } from "framer-motion";
import { DIFFERENTIATORS } from "@/lib/content";

// "What sets us apart". The client called this the key section, so it gets big numbered
// panels, an amber accent bar and room to breathe. Used on Home and About.
export default function Differentiators({ heading = "What Sets Us Apart" }: { heading?: string }) {
  return (
    <section className="py-24 md:py-32 bg-secondary text-secondary-foreground relative overflow-hidden" aria-labelledby="differentiators-heading">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-3xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[2px] w-12 bg-primary" />
            <span className="text-primary font-bold uppercase tracking-widest text-sm">Key Differentiators</span>
          </div>
          <h2 id="differentiators-heading" className="text-4xl md:text-6xl font-serif font-bold text-white">
            {heading}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-secondary-foreground/10 border border-secondary-foreground/10">
          {DIFFERENTIATORS.map((d, idx) => {
            const Icon = d.icon;
            return (
              <motion.article
                key={d.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (idx % 2) * 0.1 }}
                className="group relative bg-secondary p-8 md:p-12 hover:bg-background/5 transition-colors"
                data-testid={`differentiator-${idx}`}
              >
                <span className="absolute top-6 right-8 text-6xl md:text-7xl font-serif font-bold text-secondary-foreground/[0.07] select-none" aria-hidden="true">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="w-12 h-1 bg-primary mb-8 group-hover:w-24 transition-all duration-500" />
                <Icon className="w-9 h-9 text-primary mb-6" />
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">{d.title}</h3>
                <p className="text-secondary-foreground/75 leading-relaxed text-lg">{d.desc}</p>
                {d.tags && (
                  <ul className="flex flex-wrap gap-2 mt-6">
                    {d.tags.map((t) => (
                      <li key={t} className="text-xs md:text-sm px-3 py-1.5 border border-primary/40 text-primary/90">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
