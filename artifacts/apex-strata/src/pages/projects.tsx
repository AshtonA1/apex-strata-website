import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSeo } from "@/lib/seo";
import { Lock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PageHero from "@/components/layout/page-hero";
import { PROJECTS, CLIENTS, ProjectStatus } from "@/lib/content";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  Completed: "text-primary border-primary/30",
  Ongoing: "text-emerald-400 border-emerald-400/30",
  Pending: "text-amber-300 border-amber-300/30",
};

const findClient = (name: string) => CLIENTS.find((c) => c.name.toLowerCase() === name.toLowerCase());

// White band across the top of a project card: client logo(s) linking to the
// client's site. Clients without a logo file show their name as text; the
// confidential ones show a lock instead of a name.
function ClientBand({ names }: { names: string[] }) {
  const single = names.length === 1; // one client -> show its logo bigger
  const logoSize = single ? "max-h-14 max-w-[13rem]" : "max-h-9 max-w-[8rem]";
  return (
    <div className="bg-white -mx-8 -mt-8 mb-6 min-h-24 px-6 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
      {names.map((name) => {
        if (name.toLowerCase().includes("confidential")) {
          return (
            <span key={name} className="flex items-center gap-2 text-slate-500 font-serif font-bold text-sm">
              <Lock className="w-4 h-4" /> {name}
            </span>
          );
        }
        const client = findClient(name);
        const content = client?.logo ? (
          <img src={client.logo} alt={name} loading="lazy" className={`${logoSize} w-auto object-contain`} />
        ) : (
          <span className={`text-slate-800 font-serif font-bold text-center ${single ? "text-lg" : "text-sm"}`}>{name}</span>
        );
        return client?.url ? (
          <a
            key={name}
            href={client.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} (opens their website)`}
            className="transition-opacity hover:opacity-70"
          >
            {content}
          </a>
        ) : (
          <span key={name}>{content}</span>
        );
      })}
    </div>
  );
}

type PublicProject = (typeof PROJECTS)[number];

export default function Projects() {
  useSeo("Projects", "Selected geotechnical projects across Zimbabwe's mining sector: open pit design, heap leach pads, TSF review, shaft stability and ground control.");
  // The admin portal edits projects in the database. Start with the built-in list so the page is
  // never blank, swap in the live list once it loads, and keep the built-in list if the API is down.
  const [projects, setProjects] = useState<PublicProject[]>(PROJECTS);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((rows: PublicProject[]) => {
        if (!cancelled && Array.isArray(rows)) setProjects(rows);
      })
      .catch(() => {
        /* keep the static list */
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
            {projects.map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: (idx % 2) * 0.1 }}
                className="bg-card border border-border p-8 overflow-hidden hover:shadow-lg transition-shadow"
                data-testid={`project-card-${idx}`}
              >
                <ClientBand names={project.clients} />
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
          {projects.length === 0 && <p className="text-center text-muted-foreground py-16">New projects will be listed here soon.</p>}
        </div>
      </section>
    </div>
  );
}
