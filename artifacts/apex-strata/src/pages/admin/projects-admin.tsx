import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ExternalLink, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ErrorNote, Field, PageTitle, Spinner, errMsg, inputClass } from "@/components/admin/admin-ui";
import { api, type AdminProject, type ProjectStatus } from "@/lib/admin-api";
import { CLIENTS } from "@/lib/content";

const STATUSES: ProjectStatus[] = ["Completed", "Ongoing", "Pending"];
const STATUS_STYLES: Record<ProjectStatus, string> = {
  Completed: "text-primary border-primary/30",
  Ongoing: "text-emerald-400 border-emerald-400/30",
  Pending: "text-amber-300 border-amber-300/30",
};
// Names the website can show a logo for (plus the lock-icon placeholder).
const KNOWN_CLIENTS = [...CLIENTS.map((c) => c.name), "Confidential Client"];

type Draft = { title: string; client: string; clients: string[]; location: string; status: ProjectStatus; description: string };
const EMPTY: Draft = { title: "", client: "", clients: [], location: "", status: "Ongoing", description: "" };

export default function ProjectsAdmin() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["projects"], queryFn: () => api<AdminProject[]>("GET", "/admin/projects") });
  const [editing, setEditing] = useState<{ id: number | null; draft: Draft } | null>(null);
  const [deleting, setDeleting] = useState<AdminProject | null>(null);
  const [error, setError] = useState("");

  // /admin/projects?new=1 (from the overview's "Add a project") opens the form straight away.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      setEditing({ id: null, draft: EMPTY });
      window.history.replaceState(null, "", "/admin/projects");
    }
  }, []);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["projects"] });
    qc.invalidateQueries({ queryKey: ["summary"] });
  };

  const move = useMutation({
    mutationFn: (v: { id: number; direction: "up" | "down" }) => api<AdminProject[]>("POST", `/admin/projects/${v.id}/move`, { direction: v.direction }),
    onSuccess: (data) => qc.setQueryData(["projects"], data),
    onError: (e) => setError(errMsg(e)),
  });
  const del = useMutation({
    mutationFn: (id: number) => api("DELETE", `/admin/projects/${id}`),
    onSuccess: () => {
      setDeleting(null);
      refresh();
    },
    onError: (e) => {
      setDeleting(null);
      setError(errMsg(e));
    },
  });

  const projects = list.data ?? [];

  return (
    <div>
      <PageTitle
        title="Projects"
        subtitle="What you change here appears on the public Projects page straight away."
        action={
          <Button onClick={() => setEditing({ id: null, draft: EMPTY })} className="rounded-none" data-testid="add-project">
            <Plus /> Add project
          </Button>
        }
      />
      <div className="mb-4">
        <ErrorNote>{error}</ErrorNote>
      </div>

      {list.isLoading && <Spinner />}
      {list.isError && <ErrorNote>{errMsg(list.error)}</ErrorNote>}
      {list.data && projects.length === 0 && (
        <div className="border border-dashed border-border p-12 text-center text-muted-foreground">
          No projects yet. The public page falls back to its built-in list until you add one here.
        </div>
      )}

      <ul className="space-y-3">
        {projects.map((p, i) => (
          <li key={p.id} className="bg-card border border-border p-5 flex flex-col md:flex-row md:items-center gap-4" data-testid={`admin-project-${p.id}`}>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h3 className="font-serif font-bold text-lg text-foreground">{p.title}</h3>
                <Badge variant="outline" className={STATUS_STYLES[p.status]}>
                  {p.status}
                </Badge>
              </div>
              <p className="text-primary text-sm">{p.client}</p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3.5 h-3.5" /> {p.location}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" aria-label="Move up" disabled={i === 0 || move.isPending} onClick={() => move.mutate({ id: p.id, direction: "up" })}>
                <ArrowUp />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Move down" disabled={i === projects.length - 1 || move.isPending} onClick={() => move.mutate({ id: p.id, direction: "down" })}>
                <ArrowDown />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditing({ id: p.id, draft: { title: p.title, client: p.client, clients: p.clients, location: p.location, status: p.status, description: p.desc } })
                }
              >
                <Pencil /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDeleting(p)} aria-label={`Delete ${p.title}`}>
                <Trash2 className="text-red-400" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <a href="/projects" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mt-6">
        <ExternalLink className="w-4 h-4" /> Open public Projects page
      </a>

      {editing && (
        <ProjectForm
          key={editing.id ?? "new"}
          id={editing.id}
          initial={editing.draft}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setError("");
            refresh();
          }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.title}" will be removed from the website immediately. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && del.mutate(deleting.id)} data-testid="confirm-delete">
              Delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProjectForm({ id, initial, onClose, onSaved }: { id: number | null; initial: Draft; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Draft>(initial);
  const [error, setError] = useState("");
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const save = useMutation({
    mutationFn: () => (id === null ? api("POST", "/admin/projects", d) : api("PUT", `/admin/projects/${id}`, d)),
    onSuccess: onSaved,
    onError: (e) => setError(errMsg(e)),
  });

  const toggleClient = (name: string) =>
    set("clients", d.clients.some((c) => c.toLowerCase() === name.toLowerCase()) ? d.clients.filter((c) => c.toLowerCase() !== name.toLowerCase()) : [...d.clients, name]);
  const [custom, setCustom] = useState("");
  const addCustom = () => {
    const n = custom.trim();
    if (n && !d.clients.some((c) => c.toLowerCase() === n.toLowerCase())) set("clients", [...d.clients, n]);
    setCustom("");
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !save.isPending && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{id === null ? "Add project" : "Edit project"}</DialogTitle>
          <DialogDescription>Fields marked with a name appear on the project card.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            save.mutate();
          }}
        >
          <Field label="Project title">
            <input className={inputClass} value={d.title} onChange={(e) => set("title", e.target.value)} maxLength={200} required data-testid="pf-title" />
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Client line" hint="Shown under the title, e.g. Alpha Minerals (Pvt) Ltd">
              <input className={inputClass} value={d.client} onChange={(e) => set("client", e.target.value)} maxLength={200} required data-testid="pf-client" />
            </Field>
            <Field label="Location">
              <input className={inputClass} value={d.location} onChange={(e) => set("location", e.target.value)} maxLength={200} required data-testid="pf-location" />
            </Field>
          </div>
          <Field label="Status">
            <select className={inputClass} value={d.status} onChange={(e) => set("status", e.target.value as ProjectStatus)} data-testid="pf-status">
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">Client logos on the card</span>
            <p className="text-xs text-muted-foreground">Tap a client to show its logo. Clients without a logo file show their name as text.</p>
            <div className="flex flex-wrap gap-2">
              {KNOWN_CLIENTS.map((name) => {
                const on = d.clients.some((c) => c.toLowerCase() === name.toLowerCase());
                return (
                  <button
                    type="button"
                    key={name}
                    onClick={() => toggleClient(name)}
                    aria-pressed={on}
                    className={`px-3 py-1.5 text-xs border transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {name}
                  </button>
                );
              })}
              {d.clients
                .filter((c) => !KNOWN_CLIENTS.some((k) => k.toLowerCase() === c.toLowerCase()))
                .map((c) => (
                  <button type="button" key={c} onClick={() => toggleClient(c)} aria-pressed className="px-3 py-1.5 text-xs border bg-primary text-primary-foreground border-primary">
                    {c} ×
                  </button>
                ))}
            </div>
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="Another client name (text only)"
                maxLength={120}
              />
              <Button type="button" variant="outline" onClick={addCustom} disabled={!custom.trim()}>
                Add
              </Button>
            </div>
          </div>

          <Field label="Description">
            <textarea className={`${inputClass} min-h-[110px] resize-y`} value={d.description} onChange={(e) => set("description", e.target.value)} maxLength={3000} required data-testid="pf-desc" />
          </Field>

          <ErrorNote>{error}</ErrorNote>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending} data-testid="pf-save">
              {save.isPending ? <Spinner /> : id === null ? "Add project" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
