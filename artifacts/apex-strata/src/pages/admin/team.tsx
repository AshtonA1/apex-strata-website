import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, KeyRound, Plus, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ErrorNote, Field, PageTitle, Spinner, errMsg, inputClass } from "@/components/admin/admin-ui";
import { api, fmtDate, type AdminAccount, type Me, type Role } from "@/lib/admin-api";

export default function TeamPage({ me }: { me: Me }) {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admins"], queryFn: () => api<AdminAccount[]>("GET", "/admin/admins") });
  const [adding, setAdding] = useState(false);
  const [secret, setSecret] = useState<{ name: string; password: string } | null>(null);
  const [resetting, setResetting] = useState<AdminAccount | null>(null);
  const [error, setError] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admins"] });

  const update = useMutation({
    mutationFn: (v: { id: number; patch: Partial<Pick<AdminAccount, "role" | "active" | "name">> }) => api("PATCH", `/admin/admins/${v.id}`, v.patch),
    onSuccess: () => {
      setError("");
      refresh();
      qc.invalidateQueries({ queryKey: ["inquiries"] });
    },
    onError: (e) => setError(errMsg(e)),
  });
  const reset = useMutation({
    mutationFn: (a: AdminAccount) => api<{ temporaryPassword: string }>("POST", `/admin/admins/${a.id}/reset-password`),
    onSuccess: (r, a) => {
      setResetting(null);
      setSecret({ name: a.name, password: r.temporaryPassword });
      refresh();
    },
    onError: (e) => {
      setResetting(null);
      setError(errMsg(e));
    },
  });

  return (
    <div>
      <PageTitle
        title="Team"
        subtitle="Everyone who can sign in to this portal. Admins can manage projects and their own inbox. Only owners can see this page."
        action={
          <Button className="rounded-none" onClick={() => setAdding(true)} data-testid="add-admin">
            <Plus /> Add person
          </Button>
        }
      />
      <div className="mb-4"><ErrorNote>{error}</ErrorNote></div>
      {list.isLoading && <Spinner />}
      <ul className="space-y-3">
        {list.data?.map((a) => {
          const self = a.id === me.id;
          return (
            <li key={a.id} className={`bg-card border border-border p-5 flex flex-col md:flex-row md:items-center gap-4 ${a.active ? "" : "opacity-60"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-serif font-bold text-lg text-foreground">{a.name}{self && <span className="text-xs text-muted-foreground font-sans font-normal"> (you)</span>}</h3>
                  <Badge variant="outline" className={a.role === "owner" ? "text-primary border-primary/30" : "text-muted-foreground"}>{a.role}</Badge>
                  {!a.active && <Badge variant="outline" className="text-red-300 border-red-400/30">deactivated</Badge>}
                  {a.mustChangePassword && a.active && <Badge variant="outline" className="text-amber-300 border-amber-300/30">hasn't set password</Badge>}
                </div>
                <p className="text-sm text-muted-foreground break-all">{a.email}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Last sign-in: {fmtDate(a.lastLoginAt)}</p>
              </div>
              {!self && (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className={`${inputClass} !w-auto`}
                    value={a.role}
                    onChange={(e) => update.mutate({ id: a.id, patch: { role: e.target.value as Role } })}
                    aria-label={`Role for ${a.name}`}
                  >
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                  <Button variant="outline" size="sm" onClick={() => setResetting(a)}>
                    <KeyRound /> Reset password
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => update.mutate({ id: a.id, patch: { active: !a.active } })}>
                    {a.active ? <><UserX /> Deactivate</> : <><UserCheck /> Reactivate</>}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {adding && (
        <AddDialog
          onClose={() => setAdding(false)}
          onCreated={(name, password) => {
            setAdding(false);
            setSecret({ name, password });
            refresh();
          }}
        />
      )}

      <AlertDialog open={!!resetting} onOpenChange={(o) => !o && setResetting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset {resetting?.name}'s password?</AlertDialogTitle>
            <AlertDialogDescription>They'll be signed out everywhere and must choose a new password the next time they sign in with the temporary one you'll see next.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => resetting && reset.mutate(resetting)}>Reset password</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!secret} onOpenChange={(o) => !o && setSecret(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Temporary password</DialogTitle>
            <DialogDescription>Give this to {secret?.name} privately. It is shown only once and they must change it when they first sign in.</DialogDescription>
          </DialogHeader>
          {secret && <CopyBox value={secret.password} />}
          <DialogFooter>
            <Button onClick={() => setSecret(null)} className="rounded-none">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CopyBox({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 bg-background border border-border px-3 py-3 font-mono text-lg tracking-wide select-all" data-testid="temp-password">{value}</code>
      <Button
        variant="outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard blocked: the text is selectable */
          }
        }}
      >
        {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

function AddDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (name: string, password: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [error, setError] = useState("");
  const create = useMutation({
    mutationFn: () => api<{ admin: AdminAccount; temporaryPassword: string }>("POST", "/admin/admins", { name, email, role }),
    onSuccess: (r) => onCreated(r.admin.name, r.temporaryPassword),
    onError: (e) => setError(errMsg(e)),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && !create.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add person</DialogTitle>
          <DialogDescription>A strong temporary password is generated for them. They choose their own on first sign-in.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setError(""); create.mutate(); }}>
          <Field label="Full name"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required data-testid="new-name" /></Field>
          <Field label="Email" hint="Their replies from the inbox will be sent to this address."><input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required data-testid="new-email" /></Field>
          <Field label="Role" hint="Owners can also manage the team and see every inbox.">
            <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </Field>
          <ErrorNote>{error}</ErrorNote>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={create.isPending}>Cancel</Button>
            <Button type="submit" disabled={create.isPending} data-testid="new-submit">{create.isPending ? <Spinner /> : "Create account"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
