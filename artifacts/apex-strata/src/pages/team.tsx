import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import PageHero from "@/components/layout/page-hero";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { TEAM } from "@/lib/content";

export default function Team() {
  return (
    <div>
      <PageHero
        eyebrow="Leadership"
        title="Expertise You Can Trust"
        subtitle="Led by seasoned geotechnical engineers and geologists with extensive experience across African mining operations."
      />

      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {TEAM.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeInUp}
                className="bg-card border border-border p-8 hover:shadow-lg transition-shadow"
                data-testid={`team-${member.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <h3 className="text-2xl font-serif font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-primary font-medium mb-6">{member.role}</p>
                <p className="text-muted-foreground mb-6 leading-relaxed">{member.bio}</p>
                <div className="flex flex-col gap-2 text-sm text-foreground/80">
                  <a href={`mailto:${member.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" /> {member.email}
                  </a>
                  <a href={`tel:${member.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Phone className="w-4 h-4" /> {member.phone}
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
