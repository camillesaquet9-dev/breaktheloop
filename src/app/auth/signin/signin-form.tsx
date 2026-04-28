"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const emailSchema = z.string().email("Email invalide.");

export function SignInForm({ next, initialError }: { next: string; initialError?: string }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const supabase = getSupabaseBrowserClient();
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : undefined;

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Email invalide.");
      return;
    }
    setPending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: { emailRedirectTo: redirectTo },
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
    toast.success("Lien envoyé. Check ta boîte mail.");
  }

  async function handleGoogle() {
    setPending(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    setPending(false);
    if (error) setError(error.message);
  }

  if (sent) {
    return (
      <div
        className="p-6"
        style={{
          border: "1px solid var(--safe)",
          background: "rgba(120,200,140,0.04)",
          color: "var(--fg)",
        }}
      >
        <p
          className="text-[10px] uppercase mb-2"
          style={{ color: "var(--safe)", letterSpacing: "0.14em" }}
        >
          // LIEN ENVOYÉ
        </p>
        <p className="text-sm">
          Un email a été envoyé à <b>{email}</b>. Clique sur le lien pour entrer dans l&apos;arène.
          Le lien expire dans 1 heure.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Magic link */}
      <form onSubmit={handleEmail} className="flex flex-col gap-3">
        <label
          htmlFor="email"
          className="text-[10px] uppercase"
          style={{ color: "var(--fg-mute)", letterSpacing: "0.14em" }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="operator@domain.tld"
          required
          className="px-3 py-3 font-mono text-sm outline-none"
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--line-2)",
            color: "var(--fg)",
          }}
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-between gap-4 px-4 py-3.5 text-xs uppercase font-medium border relative transition-colors disabled:opacity-50"
          style={{
            borderColor: "var(--signal)",
            color: "var(--fg)",
            background: "linear-gradient(180deg, transparent, rgba(255,80,40,0.06))",
            letterSpacing: "0.08em",
          }}
        >
          <span
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: "var(--signal)" }}
          />
          <span>&gt;_ ENVOYER LE LIEN MAGIQUE</span>
          <span className="font-mono">{pending ? "…" : "→"}</span>
        </button>
      </form>

      <div className="flex items-center gap-3" style={{ color: "var(--fg-mute)" }}>
        <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
        <span className="text-[10px] uppercase" style={{ letterSpacing: "0.14em" }}>
          ou
        </span>
        <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={pending}
        className="flex items-center justify-between gap-4 px-4 py-3.5 text-xs uppercase font-medium border transition-colors disabled:opacity-50 hover:!border-[var(--fg)] hover:!text-[var(--fg)]"
        style={{
          borderColor: "var(--line-2)",
          color: "var(--fg-dim)",
          letterSpacing: "0.08em",
        }}
      >
        <span>CONTINUER AVEC GOOGLE</span>
        <span className="font-mono">↗</span>
      </button>

      {error && (
        <p
          role="alert"
          className="px-3 py-2 text-[12px]"
          style={{
            border: "1px solid var(--signal)",
            background: "rgba(255,80,40,0.04)",
            color: "var(--fg)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
