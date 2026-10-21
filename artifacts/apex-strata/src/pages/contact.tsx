import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/layout/page-hero";
import { COMPANY } from "@/lib/content";
import { useSeo } from "@/lib/seo";

export default function Contact() {
  useSeo("Contact", "Contact Apex Strata Consulting for geotechnical investigations, ground control, slope design and numerical modelling for your mining operation.");
  const [form, setForm] = useState({ name: "", company: "", email: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, company: form.company || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong. Please email us directly.");
      }
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please email us directly.");
      setStatus("error");
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Get In Touch"
        title="Ready to make your operation safer and smarter?"
        subtitle="Contact us today for a rapid assessment or to discuss your specific ground control challenges."
      />

      <section className="py-24 md:py-32 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="space-y-6">
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
              {status === "sent" ? (
                <div className="py-8 text-center space-y-3" role="status" data-testid="inquiry-sent">
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                  <p className="text-xl font-serif font-bold text-foreground">Thank you. We've received your inquiry.</p>
                  <p className="text-muted-foreground">One of our engineers will reply to {form.email} shortly.</p>
                </div>
              ) : (
              <form className="space-y-6" onSubmit={submit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="inq-name" className="text-sm font-medium text-foreground">Name</label>
                    <input id="inq-name" type="text" required maxLength={120} value={form.name} onChange={set("name")} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="inq-company" className="text-sm font-medium text-foreground">Company</label>
                    <input id="inq-company" type="text" maxLength={150} value={form.company} onChange={set("company")} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors" placeholder="Mining Operation Ltd" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="inq-email" className="text-sm font-medium text-foreground">Email</label>
                  <input id="inq-email" type="email" required maxLength={254} value={form.email} onChange={set("email")} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors" placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="inq-message" className="text-sm font-medium text-foreground">Message</label>
                  <textarea id="inq-message" required minLength={10} maxLength={5000} value={form.message} onChange={set("message")} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-none" placeholder="How can we help?"></textarea>
                </div>
                {/* Honeypot: invisible to people, bots fill it in and get silently ignored. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>Website<input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label>
                </div>
                {status === "error" && <p role="alert" className="text-sm text-red-400">{error}</p>}
                <Button type="submit" disabled={status === "sending"} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-none text-lg mt-4" data-testid="submit-inquiry-btn">
                  {status === "sending" ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Inquiry <ArrowRight className="ml-2 w-5 h-5" /></>}
                </Button>
              </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
