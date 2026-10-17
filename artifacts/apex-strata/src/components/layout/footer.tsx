import { Link } from "wouter";
import { NAV_LINKS, COMPANY } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="bg-background py-12 border-t border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif text-xs leading-none">
              A
            </div>
            <span className="font-serif font-bold tracking-wide text-foreground">APEX STRATA</span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} {COMPANY.name.toUpperCase()} (PRIVATE) LIMITED. All rights reserved.
          </p>
          <a href={`mailto:${COMPANY.primaryEmail}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
            {COMPANY.primaryEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
