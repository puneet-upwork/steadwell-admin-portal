import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { login, me } from "./api";
import { BrandMark } from "./BrandMark";
import { FloatingAlert } from "./ui";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@steadwell.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    me()
      .then((admin) => {
        if (admin) {
          navigate("/organizations", { replace: true });
        }
      })
      .catch(() => undefined);
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/organizations", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
    <FloatingAlert message={error} tone="error" offsetSidebar={false} onDismiss={() => setError("")} />
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-ink px-12 py-12 text-cream lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(47,106,85,0.55), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(47,106,85,0.28), transparent 45%)",
          }}
        />
        <BrandMark inverted />
        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-[1.15] tracking-tight">
            Operations console
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-cream/70">
            Staff access for organizations, plans, and prompts. Channel users never sign in here.
          </p>
        </div>
        <p className="relative text-sm text-cream/45">Steadwell · internal</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-16 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <div className="mt-10 rounded-2xl border border-sand bg-cream-card p-8 shadow-lift lg:mt-0">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-ink-muted">Use your Steadwell admin account.</p>
            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
              <label className="block text-sm font-semibold text-ink">
                Email
                <input
                  className="field"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-ink">
                Password
                <input
                  className="field"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  required
                />
              </label>
              <button className="btn-primary" type="submit" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
