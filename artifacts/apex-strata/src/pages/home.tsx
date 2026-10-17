import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroTunnel from "@/assets/images/hero-tunnel.png";
import coreSamples from "@/assets/images/core-samples.png";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { SERVICES, CLIENTS, COMPANY } from "@/lib/content";

type Testimonial = {
  id?: number;
  name: string;
  company: string;
  role?: string;
  content: string;
};

type Client = (typeof CLIENTS)[number];

// White tile so logos (drawn for light backgrounds) stay readable on the dark
// theme. Clients without a logo file render their name as text in the same tile.
function ClientTile({ client, idx }: { client: Client; idx: number }) {
  const size = client.featured
    ? "h-28 w-full sm:w-64 p-4"
    : client.logo
      ? "h-24 w-full sm:w-60 p-3"
      : "h-24 w-[calc(50%-0.5rem)] sm:w-60 p-3";

  const tile = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: idx * 0.08 }}
      className={`${size} bg-white flex items-center justify-center shadow-sm transition-transform duration-300 ${
        client.url ? "hover:-translate-y-1 hover:shadow-lg" : ""
      }`}
      data-testid={`client-${client.name.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {client.logo ? (
        <img src={client.logo} alt={client.name} loading="lazy" className="max-h-full max-w-full object-contain" />
      ) : (
        <span
          className={`font-serif font-bold text-slate-800 text-center leading-tight ${
            client.featured ? "text-xl" : "text-sm"
          }`}
        >
          {client.name}
        </span>
      )}
    </motion.div>
  );

  if (!client.url) return tile;

  return (
    <a
      href={client.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${client.name} (opens their website)`}
      className={client.featured || client.logo ? "w-full sm:w-auto" : "contents"}
    >
      {tile}
    </a>
  );
}

export default function Home() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [testimonialForm, setTestimonialForm] = useState({ name: "", company: "", role: "", content: "" });
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [testimonialSuccess, setTestimonialSuccess] = useState(false);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials");
        if (res.ok) setTestimonials(await res.json());
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoadingTestimonials(false);
      }
    };
    fetchTestimonials();
  }, []);

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTestimonial(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testimonialForm),
      });
      if (res.ok) {
        setTestimonialSuccess(true);
        setTestimonialForm({ name: "", company: "", role: "", content: "" });
      }
    } catch (error) {
      console.error("Failed to submit testimonial:", error);
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/60 to-background/95 z-10" />
          <img src={heroTunnel} alt="Underground Mine Tunnel" className="w-full h-full object-cover" />
        </motion.div>

        <div className="container relative z-10 mx-auto px-4 md:px-8 pb-16 md:pb-24 pt-32">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl">
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-[1.1] mb-8">
              Securing the Ground <br />
              <span className="text-stone-300">Beneath Your Mine.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-stone-300 max-w-2xl mb-10 leading-relaxed font-light">
              {COMPANY.tagline}.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 h-14 rounded-none">
                <Link href="/contact" data-testid="hero-consult-btn">Consult With Us</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10 hover:text-white text-lg px-8 h-14 rounded-none">
                <Link href="/services" data-testid="hero-services-btn">Explore Services</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 md:py-32 bg-background relative">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-serif font-bold mb-8 text-foreground">
                Transforming safety from a high-cost luxury into an accessible necessity.
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground leading-relaxed mb-6">
                At Apex Strata Consulting, our mission is to empower small- and medium-scale mines with agile, affordable, and actionable rock engineering solutions. We bridge the gap between high-level geotechnical science and practical, everyday mining operations.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground leading-relaxed mb-8">
                Based in Bulawayo, Zimbabwe, we deploy rapidly to deliver exactly what you need: clarity, stability, and peace of mind.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex gap-12 border-t border-border pt-8">
                <div>
                  <h4 className="text-4xl font-serif font-bold text-primary mb-2">Agile</h4>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Deployment</p>
                </div>
                <div>
                  <h4 className="text-4xl font-serif font-bold text-primary mb-2">Precise</h4>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Engineering</p>
                </div>
              </motion.div>
            </div>
            <motion.div variants={fadeInUp} className="relative h-[600px]">
              <img src={coreSamples} alt="Geological Core Samples" className="w-full h-full object-cover shadow-2xl" />
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-secondary z-[-1]"></div>
              <div className="absolute -top-6 -right-6 w-48 h-48 border-2 border-primary z-[-1]"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 md:py-32 bg-secondary text-secondary-foreground relative">
        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-4">
                <div className="h-[2px] w-12 bg-primary"></div>
                <span className="text-primary font-bold uppercase tracking-widest text-sm">Expertise</span>
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-serif font-bold">What We Do</motion.h2>
            </div>
            <motion.div variants={fadeInUp}>
              <Button asChild variant="outline" className="text-white border-white/40 hover:bg-white/10 hover:text-white rounded-none">
                <Link href="/services" data-testid="home-view-all-services">
                  View All Services <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICES.slice(0, 3).map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Card className="bg-background/5 border-secondary-foreground/10 hover:border-primary/50 hover:bg-background/10 transition-all duration-300 h-full rounded-none">
                    <CardContent className="p-8 flex flex-col h-full">
                      <div className="mb-6 p-4 bg-background/10 inline-block w-fit">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-serif font-bold mb-4 text-white">{service.title}</h3>
                      <p className="text-secondary-foreground/70 leading-relaxed flex-grow">{service.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Clients Strip */}
      <section className="py-20 bg-background border-y border-border">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.span variants={fadeInUp} className="text-primary font-bold uppercase tracking-widest text-sm">
              Trusted By
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-serif font-bold mt-2 text-foreground">
              Mining Operations Across Zimbabwe
            </motion.h2>
          </motion.div>
          <div className="flex flex-wrap items-stretch justify-center gap-6 mb-6">
            {CLIENTS.filter((c) => c.featured).map((client, idx) => (
              <ClientTile key={client.name} client={client} idx={idx} />
            ))}
          </div>
          <div className="flex flex-wrap items-stretch justify-center gap-4">
            {CLIENTS.filter((c) => !c.featured).map((client, idx) => (
              <ClientTile key={client.name} client={client} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
          >
            <motion.div variants={fadeInUp} className="flex justify-center items-center gap-4 mb-4">
              <div className="h-[2px] w-8 bg-primary"></div>
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Client Feedback</span>
              <div className="h-[2px] w-8 bg-primary"></div>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif font-bold mb-6">Trusted by Industry</motion.h2>
          </motion.div>

          {loadingTestimonials ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {testimonials.map((testimonial, idx) => (
                <Card key={testimonial.id || idx} className="bg-card rounded-none border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="text-4xl text-primary/40 font-serif mb-4">"</div>
                    <p className="text-muted-foreground mb-8 leading-relaxed italic">{testimonial.content}</p>
                    <div>
                      <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-primary">
                        {testimonial.role ? `${testimonial.role}, ` : ""}
                        {testimonial.company}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 mb-20 bg-muted/30 border border-border">
              <p className="text-lg text-muted-foreground">Client testimonials coming soon. We are proud of the results we deliver.</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto bg-card border border-border p-8 md:p-12 shadow-sm"
          >
            <h3 className="text-2xl font-serif font-bold text-foreground mb-6 text-center">Share Your Experience</h3>
            {testimonialSuccess ? (
              <div className="bg-primary/10 border border-primary/30 p-6 text-center">
                <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-foreground font-medium">Thank you for your testimonial. It will appear here once reviewed.</p>
              </div>
            ) : (
              <form onSubmit={handleTestimonialSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <input
                      type="text"
                      required
                      value={testimonialForm.name}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                      className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Company</label>
                    <input
                      type="text"
                      required
                      value={testimonialForm.company}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })}
                      className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors"
                      placeholder="Mining Corp"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Role (Optional)</label>
                  <input
                    type="text"
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Mine Manager"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Your Experience</label>
                  <textarea
                    required
                    value={testimonialForm.content}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-none"
                    placeholder="How did Apex Strata help your operation?"
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  disabled={submittingTestimonial}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-none text-lg mt-4"
                  data-testid="submit-testimonial-btn"
                >
                  {submittingTestimonial ? "Submitting..." : "Submit Testimonial"}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-white">Ready to secure your operations?</h2>
            <p className="text-xl text-secondary-foreground/80 mb-10 max-w-lg mx-auto leading-relaxed">
              Contact us today for a rapid assessment or to discuss your specific ground control challenges.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 h-14 rounded-none">
              <Link href="/contact" data-testid="cta-contact-btn">Get In Touch <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
