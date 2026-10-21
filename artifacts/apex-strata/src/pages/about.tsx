import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Compass, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/layout/page-hero";
import Differentiators from "@/components/sections/differentiators";
import coreLog from "@/assets/images/core-log.jpg";
import { COMMITMENT, FOCUS, MISSION, OVERVIEW, VALUES, VISION } from "@/lib/content";
import { useSeo } from "@/lib/seo";

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" } };

export default function About() {
  useSeo(
    "About Us",
    "Apex Strata Consulting is a specialized geotechnical engineering consultancy for the mining and civil sectors: our mission, vision, core values and what sets us apart.",
  );

  return (
    <div>
      <PageHero eyebrow="About Us" title="Practical rock engineering, grounded in data." subtitle="Who we are, what we stand for, and what sets us apart." />

      {/* Company Overview */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fade} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[2px] w-12 bg-primary" />
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Company Overview</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8 text-foreground">Who we are</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{OVERVIEW}</p>
          </motion.div>
          <motion.div {...fade} transition={{ duration: 0.7 }} className="relative">
            <img src={coreLog} alt="Drill core in a core tray beside a core log sheet on a mine site" className="w-full h-full object-cover shadow-2xl" loading="lazy" />
            <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-secondary -z-10" />
            <div className="absolute -top-5 -right-5 w-32 h-32 border-2 border-primary -z-10" />
          </motion.div>
        </div>
      </section>

      <Differentiators />

      {/* Vision & Mission */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div {...fade} transition={{ duration: 0.6 }} className="mb-14 max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[2px] w-12 bg-primary" />
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Vision & Mission</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">Our purpose and aspirations drive excellence in geotechnical engineering.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Compass, title: "Our Mission", text: MISSION },
              { icon: Eye, title: "Our Vision", text: VISION },
            ].map((b, i) => (
              <motion.div key={b.title} {...fade} transition={{ duration: 0.6, delay: i * 0.1 }} className="bg-card border border-border p-8 md:p-10 border-t-4 border-t-primary">
                <b.icon className="w-8 h-8 text-primary mb-5" />
                <h3 className="text-2xl font-serif font-bold text-foreground mb-3">{b.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{b.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {[COMMITMENT, FOCUS].map((b, i) => (
              <motion.div key={b.title} {...fade} transition={{ duration: 0.6, delay: i * 0.1 }} className="border-l-2 border-primary pl-6 py-2">
                <h3 className="text-xl font-serif font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{b.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 md:py-32 bg-card border-y border-border">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div {...fade} transition={{ duration: 0.6 }} className="mb-14 max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[2px] w-12 bg-primary" />
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Core Values</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">The principles behind every engagement.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((v, idx) => (
              <motion.div key={v.title} {...fade} transition={{ duration: 0.6, delay: (idx % 4) * 0.1 }} data-testid={`value-${idx}`}>
                <div className="p-4 bg-primary/10 inline-block mb-5">
                  <v.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-3">{v.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">Let's talk about your ground conditions.</h2>
          <Button asChild size="lg" className="rounded-none h-14 px-8 text-lg">
            <Link href="/contact">
              Consult With Us <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
