import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/content";
import Logo from "@/components/layout/logo";

export default function Nav() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero sections (home page) are dark imagery, so the nav starts
  // transparent/white-text there until the user scrolls. Every other page
  // starts with a solid bar since there's no full-bleed dark hero behind it.
  const isHome = location === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const solid = isScrolled || !isHome;

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
          solid
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm h-16"
            : "bg-transparent h-20"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <Link href="/" className="cursor-pointer z-50" data-testid="nav-logo" aria-label="Apex Strata home">
            <Logo size="md" textClassName={solid ? "text-foreground" : "text-white"} />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium tracking-wider uppercase transition-colors hover:text-primary ${
                  location === item.path ? "text-primary" : solid ? "text-foreground/80" : "text-white/90"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
              <Link href="/contact" data-testid="nav-cta">Consult With Us</Link>
            </Button>
          </div>

          <button
            className="md:hidden text-foreground relative z-50 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? (
              <X className={solid ? "text-foreground" : "text-white"} />
            ) : (
              <Menu className={solid ? "text-foreground" : "text-white"} />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden flex flex-col gap-6"
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="text-2xl font-serif text-left border-b border-border pb-4 text-foreground"
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
