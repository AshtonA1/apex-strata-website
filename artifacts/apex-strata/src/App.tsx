import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import Nav from "@/components/layout/nav";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Projects from "@/pages/projects";
import Team from "@/pages/team";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary selection:text-primary-foreground dark">
      <ScrollToTop />
      <Nav />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/services" component={Services} />
          <Route path="/projects" component={Projects} />
          <Route path="/team" component={Team} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}
