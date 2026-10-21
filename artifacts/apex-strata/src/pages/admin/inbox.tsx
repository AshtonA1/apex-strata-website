import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useRoute } from "wouter";
import { Archive, ArrowLeft, CheckCheck, Inbox as InboxIcon, Mail, Send, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ErrorNote, PageTitle, Spinner, errMsg, inputClass } from "@/components/admin/admin-ui";
import { api, fmtDate, type AdminAccount, type InquiryDetail, type InquiryRow, type InquiryStatus, type Me } from "@/lib/admin-api";

type Folder = "inbox" | "replied" | "archived";
const FOLDER_STATUS: Record<Folder, string> = { inbox: "", replied: "replied", archived: "archived" };

export default function InboxPage({ me }: { me: Me }) {
  const [, params] = useRoute("/admin/inbox/:id?");
  const selectedId = params?.id ? Number(params.id) : null;
  const [folder, setFolder] = useState<Folder>("inbox");
  const [mineOnly, setMineOnly] = useState(me.role !== "owner" ? true : false);

  const list = useQuery({
    queryKey: ["inquiries", folder, mineOnly],
    queryFn: () => {
      const qs = new URLSearchParams();
      if (FOLDER_STATUS[folder]) qs.set("status", FOLDER_STATUS[folder]);
      if (mineOnly) qs.set("mine", "1");
      return api<InquiryRow[]>("GET", `/admin/inquiries?${qs.toString()}`);
    },
    refetchInterval: 60_000,
  });

  return (
    <div>
      <PageTitle title="Inbox" subtitle={me.role === "owner" ? "Website inquiries. You can see every mailbox and reassign messages." : "Website inquiries assigned to you."} />
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] items-start">
        {/* On phones show either the list or the open message, not both. */}
        <section className={`${selectedId ? "hidden lg:block" : ""}`}>
          <div className="flex gap-1 mb-3 border-b border-border">
            {(["inbox", "replied", "archived"] as Folder[]).map((f) => (
              <button
                key={f}
                onClick={() => setFolder(f)}
                className={`px-3 py-2 text-sm capitalize border-b-2 -mb-px transition-colors ${folder === f ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {f}
              </button>
            ))}
          </div>
          {me.role === "owner" && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground mb-3 cursor-pointer">
              <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} className="accent-[hsl(var(--primary))]" />
              Only messages assigned to me
            </label>
          )}
          {list.isLoading && <Spinner />}
          {list.isError && <ErrorNote>{errMsg(list.error)}</ErrorNote>}
          {list.data?.length === 0 && (
            <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              <InboxIcon className="w-6 h-6 mx-auto mb-2 opacity-60" />
              Nothing here.
            </div>
          )}
          <ul className="border border-border divide-y divide-border bg-card">
            {list.data?.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/admin/inbox/${m.id}`}
                  className={`block px-4 py-3 transition-colors ${selectedId === m.id ? "bg-primary/10" : "hover:bg-muted/40"}`}
                  data-testid={`inquiry-${m.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`truncate text-sm ${m.status === "new" ? "font-bold text-foreground" : "text-foreground/90"}`}>
                      {m.status === "new" && <span className="inline-block w-2 h-2 bg-primary mr-2 align-middle" aria-label="Unread" />}
                      {m.name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">{new Date(m.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
                  </div>
                  {m.company && <p className="text-xs text-primary/80 truncate">{m.company}</p>}
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{m.message}</p>
                  {me.role === "owner" && <p className="text-[11px] text-muted-foreground/70 mt-1">→ {m.assignedName ?? "Unassigned"}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${selectedId ? "" : "hidden lg:block"} min-w-0`}>
          {selectedId ? (
            <MessageView key={selectedId} id={selectedId} me={me} />
          ) : (
            <div className="border border-dashed border-border p-16 text-center text-muted-foreground">
              <Mail className="w-8 h-8 mx-auto mb-3 opacity-60" />
              Select a message to read it.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MessageView({ id, me }: { id: number; me: Me }) {
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const q = useQuery({ queryKey: ["inquiry", id], queryFn: () => api<InquiryDetail>("GET", `/admin/inquiries/${id}`) });
  const people = useQuery({ queryKey: ["admins"], queryFn: () => api<AdminAccount[]>("GET", "/admin/admins"), enabled: me.role === "owner" });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Opening a message marks it read, so refresh the counters and list.
  useEffect(() => {
    if (q.data) {
      qc.invalidateQueries({ queryKey: ["unread"] });
      qc.invalidateQueries({ queryKey: ["inquiries"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
    }
  }, [q.data?.inquiry.status, qc]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["inquiry", id] });
    qc.invalidateQueries({ queryKey: ["inquiries"] });
    qc.invalidateQueries({ queryKey: ["unread"] });
    qc.invalidateQueries({ queryKey: ["summary"] });
  };

  const patch = useMutation({
    mutationFn: (v: { status?: InquiryStatus; assignedAdminId?: number }) => api("PATCH", `/admin/inquiries/${id}`, v),
    onSuccess: (_d, v) => {
      refresh();
      if (v.assignedAdminId !== undefined && me.role !== "owner") navigate("/admin/inbox");
    },
    onError: (e) => setError(errMsg(e)),
  });
  const reply = useMutation({
    mutationFn: () => api("POST", `/admin/inquiries/${id}/reply`, { subject: subject || undefined, body }),
    onSuccess: () => {
      setBody("");
      setError("");
      refresh();
    },
    onError: (e) => {
      setError(errMsg(e)); // the draft stays in the box so nothing is lost
      refresh();
    },
  });
  const del = useMutation({
    mutationFn: () => api("DELETE", `/admin/inquiries/${id}`),
    onSuccess: () => {
      refresh();
      navigate("/admin/inbox");
    },
    onError: (e) => setError(errMsg(e)),
  });

  if (q.isLoading) return <Spinner />;
  if (q.isError || !q.data)
    return (
      <div>
        <ErrorNote>{q.isError ? errMsg(q.error) : "Message not found."}</ErrorNote>
        <Link href="/admin/inbox" className="text-primary text-sm mt-4 inline-block">← Back to inbox</Link>
      </div>
    );

  const { inquiry, replies, emailConfigured } = q.data;
  const archived = inquiry.status === "archived";

  return (
    <article className="bg-card border border-border">
      <div className="p-6 border-b border-border">
        <Link href="/admin/inbox" className="lg:hidden inline-flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Inbox
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-serif font-bold text-foreground">{inquiry.name}</h2>
            {inquiry.company && <p className="text-primary text-sm">{inquiry.company}</p>}
            <a href={`mailto:${inquiry.email}`} className="text-sm text-muted-foreground hover:text-primary break-all">{inquiry.email}</a>
            <p className="text-xs text-muted-foreground mt-1">{fmtDate(inquiry.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => patch.mutate({ status: archived ? "read" : "archived" })} disabled={patch.isPending}>
              <Archive /> {archived ? "Move to inbox" : "Archive"}
            </Button>
            {me.role === "owner" && (
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)} aria-label="Delete message">
                <Trash2 className="text-red-400" />
              </Button>
            )}
          </div>
        </div>
        {me.role === "owner" && people.data && (
          <label className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
            Assigned to
            <select
              className={`${inputClass} !w-auto`}
              value={inquiry.assignedAdminId ?? ""}
              onChange={(e) => patch.mutate({ assignedAdminId: Number(e.target.value) })}
              data-testid="assign-select"
            >
              {inquiry.assignedAdminId === null && <option value="">Unassigned</option>}
              {people.data.filter((a) => a.active).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="p-6 whitespace-pre-wrap break-words text-foreground/90 leading-relaxed" data-testid="message-body">
        {inquiry.message}
      </div>

      {replies.length > 0 && (
        <div className="px-6 pb-2 space-y-4">
          {replies.map((r) => (
            <div key={r.id} className={`border-l-2 pl-4 ${r.delivered ? "border-primary" : "border-red-400"}`}>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                {r.delivered ? <CheckCheck className="w-3.5 h-3.5 text-primary" /> : <TriangleAlert className="w-3.5 h-3.5 text-red-400" />}
                {r.adminName ?? "Former staff"} · {fmtDate(r.sentAt)} {!r.delivered && <span className="text-red-300">· not delivered</span>}
              </p>
              <p className="whitespace-pre-wrap break-words text-sm text-foreground/90">{r.body}</p>
              {r.error && <p className="text-xs text-red-300 mt-1">{r.error}</p>}
            </div>
          ))}
        </div>
      )}

      <form
        className="p-6 border-t border-border mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          reply.mutate();
        }}
      >
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" /> Reply to {inquiry.name.split(" ")[0]}
        </h3>
        {!emailConfigured && <ErrorNote>Email sending isn't configured on the server yet, so replies can't be delivered.</ErrorNote>}
        <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)" maxLength={200} />
        <textarea className={`${inputClass} min-h-[140px] resize-y`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your reply…" maxLength={10000} required data-testid="reply-body" />
        <p className="text-xs text-muted-foreground">Sent as Apex Strata Consulting from the company address, with no personal name. Their answer goes to the company inbox.</p>
        <ErrorNote>{error}</ErrorNote>
        <Button type="submit" disabled={reply.isPending || !body.trim()} className="rounded-none" data-testid="reply-send">
          {reply.isPending ? <Spinner /> : <><Send /> Send reply</>}
        </Button>
      </form>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>The message and its replies will be permanently removed. Archive it instead if you may need it later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => del.mutate()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
