import { Link } from "wouter";
import { NAV_LINKS, COMPANY } from "@/lib/content";
import Logo from "@/components/layout/logo";

export default function Footer() {
  return (
    <footer className="bg-background py-12 border-t border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <Link href="/" aria-label="Apex Strata home">
            <Logo size="sm" />
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
          <div className="flex items-center gap-6">
            <a href={`mailto:${COMPANY.primaryEmail}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {COMPANY.primaryEmail}
            </a>
            <Link href="/admin" className="text-sm text-muted-foreground/60 hover:text-primary transition-colors" data-testid="footer-staff-login">
              Staff login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
