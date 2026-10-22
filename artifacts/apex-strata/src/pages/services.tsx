import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useSeo } from "@/lib/seo";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import PageHero from "@/components/layout/page-hero";
import { SERVICES } from "@/lib/content";

export default function Services() {
  useSeo("services");
  const [activeService, setActiveService] = useState<number | null>(null);

  return (
    <div>
      <PageHero
        eyebrow="Expertise"
        title="Our Services"
        subtitle="From initial investigations to rapid assessments and comprehensive ground control frameworks."
      />

      <section className="py-24 md:py-32 bg-secondary text-secondary-foreground relative">
        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Dialog key={idx} open={activeService === idx} onOpenChange={(open) => !open && setActiveService(null)}>
                  <DialogTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.6, delay: (idx % 3) * 0.1 }}
                      className="h-full group cursor-pointer"
                      onClick={() => setActiveService(idx)}
                      data-testid={`service-card-${idx}`}
                    >
                      <Card className="bg-background/5 border-secondary-foreground/10 hover:border-primary/50 hover:bg-background/10 hover:-translate-y-2 transition-all duration-300 h-full rounded-none relative overflow-hidden">
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                          <div className="mb-6 p-4 bg-background/10 inline-block w-fit group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-serif font-bold mb-4 text-white">{service.title}</h3>
                          <p className="text-secondary-foreground/70 leading-relaxed flex-grow">{service.desc}</p>
                          <div className="mt-6 flex items-center text-primary text-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details <ArrowRight className="w-4 h-4 ml-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border rounded-none">
                    <div className="h-64 w-full relative">
                      <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
                    </div>
                    <div className="p-8 md:p-10 pt-0 relative z-10">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-serif font-bold mb-4 text-foreground">{service.title}</DialogTitle>
                        <DialogDescription className="text-lg text-muted-foreground mb-6">{service.desc}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-bold text-foreground mb-3 border-b border-border pb-2">What this includes</h4>
                          <ul className="space-y-2">
                            {service.includes.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-muted/50 p-4 border border-border">
                          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">Typical Engagement</h4>
                          <p className="text-muted-foreground">{service.engagement}</p>
                        </div>
                      </div>

                      <DialogFooter className="mt-8">
                        <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-none px-8" data-testid="modal-consult-btn">
                          <Link href="/contact">Consult With Us</Link>
                        </Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
