import { motion } from "framer-motion";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/layout/page-hero";
import { COMPANY } from "@/lib/content";

export default function Contact() {
  return (
    <div>
      <PageHero
        eyebrow="Get In Touch"
        title="Ready to secure your operations?"
        subtitle="Contact us today for a rapid assessment or to discuss your specific ground control challenges."
      />

      <section className="py-24 md:py-32 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Office Location</h4>
                    <p className="text-secondary-foreground/70">{COMPANY.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Email Us</h4>
                    <a href={`mailto:${COMPANY.primaryEmail}`} className="text-secondary-foreground/70 hover:text-primary transition-colors">
                      {COMPANY.primaryEmail}
                    </a>
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
    </div>
  );
}
