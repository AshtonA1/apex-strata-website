import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PageHero from "@/components/layout/page-hero";
import { PROJECTS, ProjectStatus } from "@/lib/content";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  Completed: "text-primary border-primary/30",
  Ongoing: "text-emerald-400 border-emerald-400/30",
  Pending: "text-amber-300 border-amber-300/30",
};

export default function Projects() {
  return (
    <div>
      <PageHero
        eyebrow="Portfolio"
        title="Our Work and Expertise"
        subtitle="A selection of our project experience across Zimbabwe's mining sector. Project details reflect client confidentiality agreements where applicable."
      />

      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PROJECTS.map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: (idx % 2) * 0.1 }}
                className="bg-card border border-border p-8 hover:shadow-lg transition-shadow"
                data-testid={`project-card-${idx}`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-xl font-serif font-bold text-foreground">{project.title}</h3>
                  <Badge variant="outline" className={`shrink-0 ${STATUS_STYLES[project.status]}`}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-primary font-medium mb-2">{project.client}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" /> {project.location}
                </div>
                <p className="text-muted-foreground leading-relaxed">{project.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
