import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, FolderKanban, Inbox as InboxIcon, Plus } from "lucide-react";
import { PageTitle, Spinner } from "@/components/admin/admin-ui";
import { api, type Me, type Summary } from "@/lib/admin-api";

export default function Dashboard({ me }: { me: Me }) {
  const q = useQuery({ queryKey: ["summary"], queryFn: () => api<Summary>("GET", "/admin/summary") });
  const s = q.data;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <PageTitle title={`${greet}, ${me.name.split(" ")[0]}`} subtitle="Here's what needs your attention." />

      {q.isLoading && <Spinner />}
      {s && (
        <>
          {!s.emailConfigured && (
            <div className="mb-6 flex items-start gap-3 border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-300 shrink-0" />
              <p className="text-amber-200">
                Email sending isn't set up yet, so replies from the inbox can't be delivered. The server needs its SMTP settings (see the setup notes).
              </p>
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            <Link href="/admin/inbox" className="group bg-card border border-border p-8 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <InboxIcon className="w-6 h-6 text-primary" />
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-5xl font-serif font-bold text-foreground">{s.unreadInquiries}</p>
              <p className="text-muted-foreground mt-2">new message{s.unreadInquiries === 1 ? "" : "s"} in your inbox</p>
            </Link>

            <Link href="/admin/projects" className="group bg-card border border-border p-8 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <FolderKanban className="w-6 h-6 text-primary" />
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-5xl font-serif font-bold text-foreground">{s.projects}</p>
              <p className="text-muted-foreground mt-2">
                projects on the website
                <span className="block text-sm mt-1">
                  {(["Completed", "Ongoing", "Pending"] as const).map((k) => `${s.projectsByStatus[k] ?? 0} ${k.toLowerCase()}`).join(" · ")}
                </span>
              </p>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/admin/projects?new=1" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-sm font-medium">
              <Plus className="w-4 h-4" /> Add a project
            </Link>
            <a href="/projects" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium text-foreground hover:border-primary/50">
              View public Projects page
            </a>
          </div>
        </>
      )}
    </div>
  );
}
