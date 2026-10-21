import { Switch, Route, Redirect, useLocation } from "wouter";
import { Suspense, lazy, useEffect } from "react";
import Nav from "@/components/layout/nav";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Projects from "@/pages/projects";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";

// The admin portal is a separate chunk so public visitors never download it.
const AdminApp = lazy(() => import("@/pages/admin/admin-app"));

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}

export default function App() {
  const [location] = useLocation();

  // The whole site is dark-themed. Dialogs/menus render in a portal on <body>, outside the wrapper
  // div below, so the theme class must live on <html> for them to match.
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  if (location === "/admin" || location.startsWith("/admin/")) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground dark">
        <Suspense fallback={<div className="min-h-screen" />}>
          <AdminApp />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary selection:text-primary-foreground dark">
      <ScrollToTop />
      <Nav />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/services" component={Services} />
          <Route path="/projects" component={Projects} />
          <Route path="/about" component={About} />
          <Route path="/team">{() => <Redirect to="/about" replace />}</Route>
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}
