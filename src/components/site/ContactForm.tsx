"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type ContactPayload, contactSchema } from "@/lib/contact/schema";

/**
 * Client-side contact form.
 *
 * Security surface:
 *   - RHF + Zod front-validate before submit.
 *   - Honeypot `confirmation` field is hidden via CSS + aria-hidden + tabIndex=-1.
 *     Real users never fill it; bots often do. The server silently ok's a
 *     honeypot hit so the bot thinks it succeeded.
 *   - Turnstile widget renders only in production (needs a site key).
 *   - On 429, we surface the retry-after message.
 *
 * The server double-validates the same schema, so tampering with the
 * client can't bypass anything.
 */

type Phase = "idle" | "submitting" | "success" | "error";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ContactForm() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const form = useForm<ContactPayload>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      body: "",
      turnstileToken: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(values: ContactPayload) {
    setPhase("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          turnstileToken: turnstileToken ?? values.turnstileToken ?? "",
        }),
      });

      if (res.ok) {
        setPhase("success");
        form.reset();
        toast.success("Message envoyé.", {
          description: "Je réponds généralement sous 48h.",
        });
        return;
      }

      if (res.status === 429) {
        toast.error("Trop de tentatives.", {
          description: "Réessayez dans une heure.",
        });
      } else if (res.status === 403) {
        toast.error("Vérification anti-bot échouée.", {
          description: "Rechargez la page et réessayez.",
        });
      } else if (res.status === 400) {
        toast.error("Données invalides.", {
          description: "Vérifiez les champs du formulaire.",
        });
      } else {
        toast.error("Erreur serveur.", {
          description: "Réessayez plus tard ou écrivez à camille@breaktheloop.site.",
        });
      }
      setPhase("error");
    } catch {
      toast.error("Erreur réseau.", {
        description: "Connexion indisponible. Réessayez.",
      });
      setPhase("error");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
      aria-label="Formulaire de contact"
    >
      {/* Honeypot — visually hidden, keyboard-unreachable, aria-hidden. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0">
        <label htmlFor="confirmation">
          Ne pas remplir
          <input
            id="confirmation"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("honeypot")}
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Nom" error={form.formState.errors.name?.message}>
          <Input
            type="text"
            autoComplete="name"
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />
        </Field>

        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
        </Field>
      </div>

      <Field label="Sujet" error={form.formState.errors.subject?.message}>
        <Input
          type="text"
          aria-invalid={!!form.formState.errors.subject}
          {...form.register("subject")}
        />
      </Field>

      <Field label="Message" error={form.formState.errors.body?.message}>
        <Textarea rows={8} aria-invalid={!!form.formState.errors.body} {...form.register("body")} />
      </Field>

      {TURNSTILE_SITE_KEY ? (
        <TurnstileWidget siteKey={TURNSTILE_SITE_KEY} onToken={setTurnstileToken} />
      ) : (
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
          [dev] Turnstile désactivé — clé absente.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={phase === "submitting"}>
          {phase === "submitting" ? "Envoi…" : "Envoyer le message"}
        </Button>
        <p className="font-mono text-xs text-muted-foreground">
          Vous pouvez aussi écrire directement à{" "}
          <a
            href="mailto:camille@breaktheloop.site"
            className="text-foreground underline underline-offset-4"
          >
            camille@breaktheloop.site
          </a>
          .
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  readonly label: string;
  readonly error?: string;
  readonly children: React.ReactNode;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the Input/Textarea control is passed via `children`, Biome can't follow that through component boundaries. The wrapping-label pattern is valid HTML.
    <label className="block space-y-1.5">
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      {children}
      {error && (
        <span className="block font-mono text-xs text-accent" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

/**
 * Minimal Turnstile widget — loads the Cloudflare script once, renders the
 * explicit widget, reports the token back via `onToken`. Uses the explicit
 * rendering API so we control exactly when/where the challenge mounts.
 */
function TurnstileWidget({
  siteKey,
  onToken,
}: {
  readonly siteKey: string;
  readonly onToken: (token: string | null) => void;
}) {
  return (
    <div
      className="cf-turnstile"
      data-sitekey={siteKey}
      data-theme="auto"
      data-callback="__breaktheloop_turnstile_cb"
      ref={(el) => {
        if (!el) return;
        // Bridge the global callback to the React state setter.
        const w = window as unknown as {
          __breaktheloop_turnstile_cb?: (token: string) => void;
          turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => void };
        };
        w.__breaktheloop_turnstile_cb = (token: string) => onToken(token);

        if (document.querySelector("script[data-turnstile-loader]")) return;
        const s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        s.defer = true;
        s.setAttribute("data-turnstile-loader", "1");
        s.onload = () => {
          if (w.turnstile) {
            w.turnstile.render(el, {
              sitekey: siteKey,
              theme: "auto",
              callback: (token: string) => onToken(token),
            });
          }
        };
        document.head.appendChild(s);
      }}
    />
  );
}
