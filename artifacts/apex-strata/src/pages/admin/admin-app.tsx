import { useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Route, Switch, useLocation } from "wouter";
import { FolderKanban, Inbox as InboxIcon, LayoutDashboard, LogOut, UserCog, Users } from "lucide-react";
import Logo from "@/components/layout/logo";
import { Spinner } from "@/components/admin/admin-ui";
import { api, ApiError, setCsrfToken, setUnauthorizedHandler, type Me } from "@/lib/admin-api";
import Login from "./login";
import Dashboard from "./dashboard";
import ProjectsAdmin from "./projects-admin";
import InboxPage from "./inbox";
import TeamPage from "./team";
import AccountPage, { ForcedPasswordChange } from "./account";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: true, staleTime: 15_000 } },
});

type MeResponse = { admin: Me; csrfToken: string };

export function useMe() {
  return useQuery<Me | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const r = await api<MeResponse>("GET", "/admin/me");
        setCsrfToken(r.csrfToken);
        return r.admin;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null; // not signed in
        throw e;
      }
    },
  });
}

function Gate() {
  const qc = useQueryClient();
  const me = useMe();

  // Keep search engines out and give the tab a clear title.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    const prev = document.title;
    document.title = "Admin | Apex Strata";
    return () => {
      meta.remove();
      document.title = prev;
    };
  }, []);

  // Any 401 from the API (expired or revoked session) drops back to the login screen.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setCsrfToken("");
      qc.clear();
      qc.setQueryData(["me"], null);
    });
    return () => setUnauthorizedHandler(null);
  }, [qc]);

  if (me.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }
  if (me.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-foreground mb-4">Can't reach the server right now.</p>
          <button className="text-primary underline" onClick={() => me.refetch()}>
            Try again
          </button>
        </div>
      </div>
    );
  }
  if (!me.data) return <Login />;
  if (me.data.mustChangePassword) return <ForcedPasswordChange me={me.data} />;
  return <Shell me={me.data} />;
}

function Shell({ me }: { me: Me }) {
  const qc = useQueryClient();
  const [location, navigate] = useLocation();
  const unread = useQuery({
    queryKey: ["unread"],
    queryFn: () => api<{ unread: number }>("GET", "/admin/inquiries/unread-count"),
    refetchInterval: 60_000,
  });

  const logout = async () => {
    try {
      await api("POST", "/admin/logout");
    } finally {
      setCsrfToken("");
      qc.clear();
      qc.setQueryData(["me"], null);
      navigate("/admin");
    }
  };

  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/inbox", label: "Inbox", icon: InboxIcon, badge: unread.data?.unread },
    ...(me.role === "owner" ? [{ href: "/admin/team", label: "Team", icon: Users }] : []),
    { href: "/admin/account", label: "Account", icon: UserCog },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/admin" aria-label="Admin home">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:block text-muted-foreground">
              {me.name} <span className="text-xs uppercase tracking-wider text-primary/80">· {me.role}</span>
            </span>
            <button onClick={logout} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="admin-logout">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
        <nav className="container mx-auto px-4 md:px-8 flex gap-1 overflow-x-auto" aria-label="Admin sections">
          {links.map((l) => {
            const active = l.exact ? location === l.href : location.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <l.icon className="w-4 h-4" />
                {l.label}
                {l.badge ? <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 min-w-5 text-center">{l.badge}</span> : null}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-8 py-8">
        <Switch>
          <Route path="/admin">{() => <Dashboard me={me} />}</Route>
          <Route path="/admin/projects" component={ProjectsAdmin} />
          <Route path="/admin/inbox/:id?">{() => <InboxPage me={me} />}</Route>
          <Route path="/admin/team">{() => (me.role === "owner" ? <TeamPage me={me} /> : <NoAccess />)}</Route>
          <Route path="/admin/account">{() => <AccountPage me={me} />}</Route>
          <Route>{() => <p className="text-muted-foreground">That page doesn't exist.</p>}</Route>
        </Switch>
      </main>
    </div>
  );
}

function NoAccess() {
  return <p className="text-muted-foreground">Only the account owner can see this page.</p>;
}

export default function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Gate />
    </QueryClientProvider>
  );
}
