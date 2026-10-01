import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Compass, Hammer, TrendingUp, ShieldCheck, BookOpen, AlertTriangle, ChevronRight, Menu, X, ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import heroTunnel from "@/assets/images/hero-tunnel.png";
import coreSamples from "@/assets/images/core-samples.png";
import openPit from "@/assets/images/open-pit.png";
import rockTexture from "@/assets/images/rock-texture.png";
import serviceCoreLogging from "@/assets/images/service-core-logging.png";
import serviceRapidAssessment from "@/assets/images/service-rapid-assessment.png";
import serviceGroundControl from "@/assets/images/service-ground-control.png";
import serviceRiskFramework from "@/assets/images/service-risk-framework.png";
import serviceTraining from "@/assets/images/service-training.png";
import serviceTsfReview from "@/assets/images/service-tsf-review.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const SERVICES = [
  {
    icon: <Compass className="w-8 h-8 text-primary" />,
    title: "Geotechnical Investigations & Core Logging",
    desc: "Comprehensive site investigations, soil profiling, structural data evaluation, and geotechnical core logging.",
    image: serviceCoreLogging,
    includes: [
      "Detailed geotechnical core logging (RQD, Q-system, RMR)",
      "Structural mapping and kinematic analysis",
      "Soil profiling and material characterization",
      "In-situ testing supervision and data interpretation",
      "Comprehensive baseline geotechnical reports"
    ],
    engagement: "Typically a 2-4 week field deployment followed by a detailed factual reporting phase."
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-primary" />,
    title: "Rapid Geotechnical Assessments",
    desc: "Standardized, rapid-deployment baseline assessments of ground conditions and preliminary hazard identification.",
    image: serviceRapidAssessment,
    includes: [
      "High-level site walkovers and visual inspections",
      "Identification of immediate stability hazards",
      "Preliminary rock mass classification",
      "Review of existing ground support practices",
      "Actionable short-term stability recommendations"
    ],
    engagement: "Typically a 3-5 day rapid site visit with immediate debriefing and a concise findings memo."
  },
  {
    icon: <Hammer className="w-8 h-8 text-primary" />,
    title: "Practical Ground Control Recommendations",
    desc: "Clear designs for underground development (support systems, extraction sequencing) and open-pit mining (slope stability, kinematic analysis).",
    image: serviceGroundControl,
    includes: [
      "Empirical and numerical support design (rockbolts, mesh, shotcrete)",
      "Pillar sizing and extraction sequencing strategies",
      "Open pit bench and overall slope angle design",
      "Kinematic analysis for structurally controlled failures",
      "Review of blasting practices on wall control"
    ],
    engagement: "Project-based design packages ranging from 2 weeks to 2 months depending on complexity."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: "Ground Control Frameworks & Risk Management",
    desc: "Develop standards from the ground up, including Bowtie analysis, Fatal Risk Control Protocols, and Ground Control Management Plans (GCMPs).",
    image: serviceRiskFramework,
    includes: [
      "Development of Ground Control Management Plans (GCMPs)",
      "Facilitation of Bowtie risk assessments for major hazards",
      "Drafting of Principal Hazard Management Plans (PHMPs)",
      "Creation of Standard Operating Procedures (SOPs) for ground support",
      "Audit and review of existing risk frameworks"
    ],
    engagement: "Collaborative 1-3 month engagements working closely with site safety and technical teams."
  },
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: "On-Site Personnel Training",
    desc: "Hands-on workshops to empower mine workers and supervisors with fundamental rock mass characterization and hazard identification skills.",
    image: serviceTraining,
    includes: [
      "Basic rock mechanics principles for operators",
      "Hazard identification (loose rock, structural wedges, water inflow)",
      "Ground support installation quality control",
      "Reading and interpreting ground behavior and monitoring data",
      "Tailored curriculum based on site-specific conditions"
    ],
    engagement: "1-3 day interactive workshops delivered on-site to shift crews and line management."
  },
  {
    icon: <AlertTriangle className="w-8 h-8 text-primary" />,
    title: "TSF Geotechnical Reviews",
    desc: "Independent post-design assessments, seepage analysis, and advanced slope stability modeling for Tailings Storage Facilities.",
    image: serviceTsfReview,
    includes: [
      "Independent third-party review of TSF designs",
      "Slope stability analysis (limit equilibrium and numerical methods)",
      "Seepage and groundwater flow modeling",
      "Review of instrumentation and monitoring data",
      "Compliance checks against international standards (GISTM)"
    ],
    engagement: "Comprehensive design review packages typically spanning 4-6 weeks."
  }
];

const PORTFOLIO = [
  {
    title: "Slope Stability Analysis",
    location: "Open Pit Gold Mine, Zimbabwe",
    desc: "Detailed kinematic and numerical analysis to optimize overall slope angles, resulting in improved stripping ratios while maintaining safety factors."
  },
  {
    title: "Underground Support Design",
    location: "Tin Mine, Tanzania",
    desc: "Complete support system design for development headings in highly fractured ground, establishing standardized installation protocols."
  },
  {
    title: "TSF Stability Review",
    location: "Mid-tier Operation, Zambia",
    desc: "Comprehensive post-design geotechnical review and advanced seepage modeling to ensure compliance with updated international standards."
  },
  {
    title: "Ground Control Framework",
    location: "PGM Producer, South Africa",
    desc: "Full GCMP development and personnel training, shifting the operation from reactive hazard management to a proactive risk-based approach."
  }
];

type Testimonial = {
  id?: number;
  name: string;
  company: string;
  role?: string;
  content: string;
  createdAt?: string;
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState<number | null>(null);
  
  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [testimonialForm, setTestimonialForm] = useState({ name: '', company: '', role: '', content: '' });
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [testimonialSuccess, setTestimonialSuccess] = useState(false);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonials');
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
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
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonialForm)
      });
      if (res.ok) {
        setTestimonialSuccess(true);
        setTestimonialForm({ name: '', company: '', role: '', content: '' });
      }
    } catch (error) {
      console.error('Failed to submit testimonial:', error);
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
      setActiveService(null);
    }
  };

  const navLinks = ["Mission", "Services", "Why Us", "Portfolio", "Team", "Contact"];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-primary-foreground dark">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm h-16" : "bg-transparent h-20"}`}>
        <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer z-50" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} data-testid="nav-logo">
            <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif text-xl leading-none">A</div>
            <span className={`font-serif font-bold text-xl tracking-wide ${isScrolled ? "text-foreground" : "text-white"}`}>APEX STRATA</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <button 
                key={item} 
                onClick={() => scrollTo(item.toLowerCase().replace(" ", "-"))}
                className={`text-sm font-medium tracking-wider uppercase transition-colors hover:text-primary ${isScrolled ? "text-foreground/80" : "text-white/90"}`}
                data-testid={`nav-${item.toLowerCase().replace(" ", "-")}`}
              >
                {item}
              </button>
            ))}
          </div>

          <button className="md:hidden text-foreground relative z-50 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-btn">
            {mobileMenuOpen ? <X className={isScrolled ? "text-foreground" : "text-white"} /> : <Menu className={isScrolled ? "text-foreground" : "text-white"} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden flex flex-col gap-6"
          >
            {navLinks.map((item) => (
              <button 
                key={item} 
                onClick={() => scrollTo(item.toLowerCase().replace(" ", "-"))}
                className="text-2xl font-serif text-left border-b border-border pb-4 text-foreground"
                data-testid={`mobile-nav-${item.toLowerCase().replace(" ", "-")}`}
              >
                {item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/60 to-background/95 z-10" />
          <img src={heroTunnel} alt="Underground Mine Tunnel" className="w-full h-full object-cover" />
        </motion.div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-8 pb-16 md:pb-24 pt-32">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-[1.1] mb-8">
              Securing the Ground <br/><span className="text-stone-300">Beneath Your Mine.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-stone-300 max-w-2xl mb-10 leading-relaxed font-light">
              World-class rock engineering solutions for small to medium-scale mining operations. Agile, authoritative, and built for the field.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 h-14 rounded-none" onClick={() => scrollTo("contact")} data-testid="hero-consult-btn">
                Consult With Us
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 hover:text-white text-lg px-8 h-14 rounded-none" onClick={() => scrollTo("services")} data-testid="hero-services-btn">
                Explore Services
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-24 md:py-32 bg-background relative">
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

      {/* Services Section */}
      <section id="services" className="py-24 md:py-32 bg-secondary text-secondary-foreground relative">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
          <img src={rockTexture} alt="Rock Texture" className="w-full h-full object-cover" />
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div className="max-w-2xl">
              <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-4">
                <div className="h-[2px] w-12 bg-primary"></div>
                <span className="text-primary font-bold uppercase tracking-widest text-sm">Expertise</span>
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-serif font-bold">Our Services</motion.h2>
            </div>
            <motion.p variants={fadeInUp} className="text-lg text-secondary-foreground/80 max-w-md">
              From initial investigations to rapid assessments and comprehensive ground control frameworks.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, idx) => (
              <Dialog key={idx} open={activeService === idx} onOpenChange={(open) => !open && setActiveService(null)}>
                <DialogTrigger asChild>
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="h-full group cursor-pointer"
                    onClick={() => setActiveService(idx)}
                    data-testid={`service-card-${idx}`}
                  >
                    <Card className="bg-background/5 border-secondary-foreground/10 hover:border-primary/50 hover:bg-background/10 hover:-translate-y-2 transition-all duration-300 h-full rounded-none relative overflow-hidden">
                      <CardContent className="p-8 flex flex-col h-full relative z-10">
                        <div className="mb-6 p-4 bg-background/10 inline-block w-fit group-hover:bg-primary/20 transition-colors">{service.icon}</div>
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
                      <DialogDescription className="text-lg text-muted-foreground mb-6">
                        {service.desc}
                      </DialogDescription>
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
                      <Button onClick={() => scrollTo("contact")} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-none px-8" data-testid="modal-consult-btn">
                        Consult With Us
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us & Values */}
      <section id="why-us" className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-4">
                <div className="h-[2px] w-12 bg-primary"></div>
                <span className="text-primary font-bold uppercase tracking-widest text-sm">Differentiators</span>
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif font-bold mb-10">Why Choose Us</motion.h2>
              
              <div className="space-y-6">
                {[
                  { title: "Technical Prowess", desc: "Advanced analytical tools — Rocscience suite, FLAC3D, MAP3D and more." },
                  { title: "Customer Focus", desc: "Deliverables range from highly technical reports to field-ready operational guides." },
                  { title: "Agile", desc: "Rapid deployment to sites and extremely fast turnaround times." },
                  { title: "Versatility", desc: "Deep expertise across both surface and underground environments." },
                  { title: "Impartiality & Independence", desc: "Unbiased third-party reviews and rigorous QA/QC." },
                  { title: "Experience", desc: "Built on years of direct involvement with small to mid-tier mining operators." }
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeInUp} className="flex items-start gap-4">
                    <div className="mt-1 bg-primary/20 p-1">
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }}
              variants={staggerContainer}
              className="relative"
            >
              <motion.div variants={fadeInUp} className="aspect-[4/3] w-full relative overflow-hidden mb-8 lg:mb-12">
                <img src={openPit} alt="Open Pit Mine" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-secondary/20 mix-blend-multiply"></div>
              </motion.div>

              <motion.div variants={fadeInUp} className="bg-card p-8 md:p-10 border border-border shadow-xl relative mt-0 lg:-mt-32 ml-0 md:ml-12 z-10">
                <h3 className="text-2xl font-serif font-bold mb-8">Our Core Values</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-serif font-bold text-primary mb-2">Integrity</h4>
                    <p className="text-muted-foreground">Uncompromising honesty in all our assessments and recommendations.</p>
                  </div>
                  <div className="h-px w-full bg-border"></div>
                  <div>
                    <h4 className="text-xl font-serif font-bold text-primary mb-2">Customer Focus</h4>
                    <p className="text-muted-foreground">We build solutions tailored to your operational realities, not academic ideals.</p>
                  </div>
                  <div className="h-px w-full bg-border"></div>
                  <div>
                    <h4 className="text-xl font-serif font-bold text-primary mb-2">Excellence</h4>
                    <p className="text-muted-foreground">World-class technical rigor applied to every project, regardless of scale.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 md:py-32 bg-secondary text-secondary-foreground relative">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-16 md:mb-20 text-center max-w-3xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="flex justify-center items-center gap-4 mb-4">
              <div className="h-[2px] w-8 bg-primary"></div>
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Portfolio</span>
              <div className="h-[2px] w-8 bg-primary"></div>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">Our Work and Expertise</motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-secondary-foreground/80 italic">
              Project details have been anonymized in accordance with client confidentiality agreements.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PORTFOLIO.map((project, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-background/5 border border-secondary-foreground/10 p-8 hover:bg-background/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-serif font-bold text-white">{project.title}</h3>
                  <Badge variant="outline" className="text-primary border-primary/30 shrink-0 ml-4 hidden sm:flex">Case Study</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-foreground/60 mb-4">
                  <MapPin className="w-4 h-4" /> {project.location}
                </div>
                <p className="text-secondary-foreground/80 leading-relaxed">
                  {project.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 md:py-32 bg-muted/30 border-y border-border relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
          >
            <motion.div variants={fadeInUp} className="flex justify-center items-center gap-4 mb-4">
              <div className="h-[2px] w-8 bg-primary"></div>
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Leadership</span>
              <div className="h-[2px] w-8 bg-primary"></div>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif font-bold mb-6">Expertise You Can Trust</motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
              Led by seasoned geotechnical engineers with extensive experience across African mining operations.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card border border-border p-8 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-2xl font-serif font-bold text-foreground mb-1">Abercon Mbedzi</h3>
              <p className="text-primary font-medium mb-6">Principal Geotechnical Engineer</p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                MSc Geotechnical Engineering (University of Cape Town). Specialist in advanced numerical modeling, slope stability analysis, and geotechnical domain characterization.
              </p>
              <div className="flex flex-col gap-2 text-sm text-foreground/80">
                <a href="mailto:aberconmbedzi@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" /> aberconmbedzi@gmail.com
                </a>
                <a href="tel:+263775278800" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="w-4 h-4" /> +263 775 278 800
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card border border-border p-8 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-2xl font-serif font-bold text-foreground mb-1">Freddy Chikwiri</h3>
              <p className="text-primary font-medium mb-6">Principal Geotechnical Engineer</p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                BSc Geology & Earth Science (Wits) & MSc Mining Engineering Rock Mechanics (Camborne School of Mines, UK). Experience across large-scale PGM mines and small/mid-tier tin and tungsten mines in East Africa.
              </p>
              <div className="flex flex-col gap-2 text-sm text-foreground/80">
                <a href="mailto:freddychikwiri@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" /> freddychikwiri@gmail.com
                </a>
                <a href="tel:+263782472100" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="w-4 h-4" /> +263 782 472 100
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 md:py-32 bg-background relative overflow-hidden">
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
                      <p className="text-sm text-primary">{testimonial.role ? `${testimonial.role}, ` : ''}{testimonial.company}</p>
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
                      onChange={e => setTestimonialForm({...testimonialForm, name: e.target.value})}
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
                      onChange={e => setTestimonialForm({...testimonialForm, company: e.target.value})}
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
                    onChange={e => setTestimonialForm({...testimonialForm, role: e.target.value})}
                    className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors" 
                    placeholder="Mine Manager" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Your Experience</label>
                  <textarea 
                    required
                    value={testimonialForm.content}
                    onChange={e => setTestimonialForm({...testimonialForm, content: e.target.value})}
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

      {/* CTA / Contact Section */}
      <section id="contact" className="py-24 md:py-32 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-white">Ready to secure your operations?</h2>
              <p className="text-xl text-secondary-foreground/80 mb-10 max-w-lg leading-relaxed">
                Contact us today for a rapid assessment or to discuss your specific ground control challenges.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Office Location</h4>
                    <p className="text-secondary-foreground/70">108 Chelmsford Road, Matshemhlophe<br/>Bulawayo, Zimbabwe</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Email Us</h4>
                    <a href="mailto:aberconmbedzi@gmail.com" className="text-secondary-foreground/70 hover:text-primary transition-colors">aberconmbedzi@gmail.com</a>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-background p-8 md:p-12 text-foreground"
            >
              <h3 className="text-2xl font-serif font-bold text-foreground mb-6">Send an Inquiry</h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <input type="text" className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Company</label>
                    <input type="text" className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors" placeholder="Mining Operation Ltd" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input type="email" className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors" placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <textarea className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-none" placeholder="How can we help?"></textarea>
                </div>
                <Button type="button" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-none text-lg mt-4" data-testid="submit-inquiry-btn">
                  Submit Inquiry <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-8 border-t border-border">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif text-xs leading-none">A</div>
            <span className="font-serif font-bold tracking-wide text-foreground">APEX STRATA</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} APEX STRATA CONSULTING (PRIVATE) LIMITED. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
