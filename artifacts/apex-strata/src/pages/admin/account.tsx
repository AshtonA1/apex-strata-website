import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/layout/logo";
import { ErrorNote, Field, PageTitle, Spinner, SuccessNote, errMsg, inputClass } from "@/components/admin/admin-ui";
import { api, setCsrfToken, type Me } from "@/lib/admin-api";

function PasswordForm({ me, onDone, forced }: { me: Me; onDone: () => void; forced?: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");
    if (next !== again) return setError("The two new passwords don't match.");
    setBusy(true);
    try {
      await api("POST", "/admin/change-password", { currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setAgain("");
      setOk("Password changed. Your other signed-in devices were signed out.");
      onDone();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-card border border-border p-8 space-y-5 max-w-lg" data-testid="password-form">
      <div className="flex items-center gap-3">
        <div className="bg-primary/15 p-2.5">
          <KeyRound className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-serif font-bold text-foreground">{forced ? "Choose your own password" : "Change password"}</h2>
      </div>
      {forced && <p className="text-sm text-muted-foreground">You signed in with a temporary password. Pick a new one that only you know before continuing.</p>}
      <Field label={forced ? "Temporary password" : "Current password"}>
        <input type="password" className={inputClass} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required data-testid="pw-current" />
      </Field>
      <Field label="New password" hint="At least 12 characters. A few random words works well, e.g. a sentence only you would write.">
        <input type="password" className={inputClass} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required data-testid="pw-new" />
      </Field>
      <Field label="Repeat new password">
        <input type="password" className={inputClass} value={again} onChange={(e) => setAgain(e.target.value)} autoComplete="new-password" required data-testid="pw-again" />
      </Field>
      <ErrorNote>{error}</ErrorNote>
      <SuccessNote>{ok}</SuccessNote>
      <Button type="submit" disabled={busy} className="rounded-none" data-testid="pw-submit">
        {busy ? <Spinner /> : "Update password"}
      </Button>
      <span className="sr-only">{me.email}</span>
    </form>
  );
}

export function ForcedPasswordChange({ me }: { me: Me }) {
  const qc = useQueryClient();
  const signOut = async () => {
    try {
      await api("POST", "/admin/logout");
    } finally {
      setCsrfToken("");
      qc.clear();
      qc.setQueryData(["me"], null);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <PasswordForm forced me={me} onDone={() => qc.invalidateQueries({ queryKey: ["me"] })} />
        <button onClick={signOut} className="block mx-auto text-sm text-muted-foreground hover:text-foreground">
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AccountPage({ me }: { me: Me }) {
  return (
    <div>
      <PageTitle title="Your account" />
      <div className="bg-card border border-border p-8 max-w-lg mb-8 space-y-1">
        <p className="text-foreground font-medium">{me.name}</p>
        <p className="text-muted-foreground text-sm">{me.email}</p>
        <p className="text-xs uppercase tracking-wider text-primary/80 pt-1">{me.role === "owner" ? "Owner" : "Admin"}</p>
      </div>
      <PasswordForm me={me} onDone={() => {}} />
    </div>
  );
}
