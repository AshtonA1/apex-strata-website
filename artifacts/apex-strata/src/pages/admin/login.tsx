import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/layout/logo";
import { ErrorNote, Field, Spinner, errMsg, inputClass } from "@/components/admin/admin-ui";
import { api, setCsrfToken, type Me } from "@/lib/admin-api";

export default function Login() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api<{ admin: Me; csrfToken: string }>("POST", "/admin/login", { email, password });
      setCsrfToken(r.csrfToken);
      setPassword("");
      qc.setQueryData(["me"], r.admin);
    } catch (err) {
      setError(errMsg(err));
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <form onSubmit={submit} className="bg-card border border-border p-8 space-y-5" data-testid="login-form">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/15 p-2.5">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">Staff sign in</h1>
              <p className="text-sm text-muted-foreground">Apex Strata admin portal</p>
            </div>
          </div>

          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              maxLength={254}
              data-testid="login-email"
            />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                className={`${inputClass} pr-10`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                maxLength={200}
                data-testid="login-password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <ErrorNote>{error}</ErrorNote>

          <Button type="submit" disabled={busy || !email || !password} className="w-full h-11 rounded-none" data-testid="login-submit">
            {busy ? <Spinner /> : "Sign in"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Forgot your password? Ask the account owner to reset it for you.
          </p>
        </form>
        <Link href="/" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary mt-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to website
        </Link>
      </div>
    </div>
  );
}
