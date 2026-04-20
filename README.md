# breaktheloop.site

Portfolio cybersécurité — **Camille Saquet**. Étudiant BUT R&T option cybersécurité à Lannion, admis à l'ESNA (Ingénieur Cyberdéfense). À la recherche d'une alternance 3 ans rentrée septembre 2026 : red team / pentest / SOC N2–N3.

> Direction design : **brutalist editorial**. Pas de glassmorphism, pas de blur, pas de particules. Ivoire `#FAFAF7` / noir `#0A0A0A` / rouge sang `#8B1A1A`. Typographies : Instrument Serif + JetBrains Mono + Inter.

---

## Stack

| Couche           | Choix                                                                |
| ---------------- | -------------------------------------------------------------------- |
| Framework        | Next.js 16 (App Router, Turbopack), React 19, TypeScript strict      |
| Styling          | Tailwind v4 (CSS-first, `@theme`), shadcn `base-nova` + `@base-ui/react` |
| 3D               | React Three Fiber + drei (Kill Chain scene, lazy-mounted)            |
| Formulaires      | React Hook Form + Zod (validation partagée client/serveur)           |
| Persistance      | Supabase Postgres — RLS forcée, service_role côté serveur uniquement |
| Rate limit       | Upstash Redis — sliding window 3/h/IP (fallback mémoire en dev)      |
| Anti-bot         | Cloudflare Turnstile + honeypot (silent success)                     |
| Email            | Resend (forward du message vers l'inbox owner)                       |
| Tests            | Vitest (unit) + Playwright (e2e smoke)                               |
| Qualité          | Biome (lint + format), tsc strict, CodeQL weekly                     |
| CI               | GitHub Actions (lint · typecheck · test · build) + Dependabot groupé |
| Hébergement      | Vercel (runtime Node pour l'API contact, edge pour l'OG image)       |

---

## Setup local

```bash
# 1. Prérequis : Node 20+, pnpm 10.33+
pnpm install

# 2. Variables d'environnement
cp .env.example .env.local
# → remplir les valeurs (Supabase, Resend, Upstash, Turnstile)
# → pour dev rapide sans Turnstile : NODE_ENV=development suffit
#   (le handler relâche la vérification en non-prod)

# 3. Générer un sel IP robuste
openssl rand -hex 32
# → le coller dans SECRET_IP_SALT

# 4. Migration Supabase
supabase db push            # ou copier le SQL de supabase/migrations/ dans l'éditeur

# 5. Lancer le dev server
pnpm dev                    # http://localhost:3000
```

### Scripts utiles

```bash
pnpm lint          # biome check .
pnpm lint:fix      # biome check --write .
pnpm typecheck     # tsc --noEmit
pnpm test          # vitest run (unit)
pnpm test:e2e      # playwright smoke (build + start automatique)
pnpm build         # next build
pnpm start         # next start (prod server)
```

---

## Déploiement (Vercel)

1. **Connecter le repo** à Vercel, ne rien build avant d'avoir ajouté les env vars.
2. **Copier tout `.env.example`** dans Project Settings → Environment Variables (Production + Preview).
3. **DNS** : pointer `breaktheloop.site` (Apex) vers Vercel, puis `www` en redirect 301.
4. **Supabase** : appliquer les migrations (`supabase db push`) sur le projet prod.
5. **Turnstile** : créer deux widgets (un dev `localhost`, un prod `breaktheloop.site`), coller les site keys + secrets.
6. **Upstash Redis** : créer une DB REST, coller URL + token.
7. **Resend** : vérifier le domaine `breaktheloop.site`, créer un sender `hello@breaktheloop.site`.

Le premier déploiement prod buildera le sitemap + robots + OG dynamique. Tester :

```bash
curl -sI https://breaktheloop.site | grep -E 'content-security-policy|strict-transport-security'
# → doit renvoyer un CSP avec nonce + HSTS max-age≥15552000
curl -s https://breaktheloop.site/robots.txt
curl -s https://breaktheloop.site/sitemap.xml | head -20
```

---

## Checklist sécurité

- [x] **CSP strict** avec nonces per-request, `strict-dynamic`, `frame-ancestors 'none'`.
- [x] **HSTS** `max-age=15552000; includeSubDomains; preload`.
- [x] **COOP** `same-origin`, **CORP** `same-origin`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- [x] **Permissions-Policy** minimaliste (camera, micro, geo, paiement, etc. désactivés).
- [x] **Zod double-validation** : même schéma côté client (RHF) et serveur (API route).
- [x] **RLS Postgres forcée**, `REVOKE ALL` de `anon` et `authenticated`, service_role uniquement côté serveur.
- [x] **CHECK constraints** au niveau DB (longueurs name/email/subject/body, ip_hash = 64 chars).
- [x] **SHA-256 salé** pour les IPs — jamais stockées en clair. Sel ≥ 32 chars enforced au runtime.
- [x] **Rate limit** 3/h/IP avec Upstash sliding window, court-circuit AVANT Turnstile (protection budget).
- [x] **Cloudflare Turnstile** server-side siteverify, fail-closed en prod, fail-open en dev.
- [x] **Honeypot** silent-success — le bot croit avoir réussi, pas de retry.
- [x] **Handler pur** avec dependency injection → tests unitaires sans I/O ni réseau.
- [x] **Generic error payloads** — pas de fingerprinting de l'étape qui a échoué.
- [x] **`server-only` import** sur les modules qui touchent Supabase service_role, Resend, Upstash, hash IP.
- [x] **CodeQL** `security-extended` + `security-and-quality`, scan hebdo.
- [x] **Dependabot** hebdo, updates groupées.

## Accessibilité

- Skip link visible au focus.
- `prefers-reduced-motion` respecté partout (intro typewriter, animations, Kill Chain).
- Liste HTML accessible comme surface canonique du Kill Chain (R3F n'est que de la décoration).
- Labels explicites sur tous les inputs, erreurs en `role="alert"`, `aria-invalid` quand nécessaire.

---

## Structure

```
src/
  app/                    # Next.js App Router — routes
    api/contact/          # POST /api/contact — adapter vers le handler pur
    projects/             # /projects + /projects/[slug]
    sitemap.ts            # Sitemap dynamique
    robots.ts             # robots.txt
    opengraph-image.tsx   # OG image 1200x630 edge-runtime
  components/
    kill-chain/           # R3F scene + SVG fallback + a11y liste
    site/                 # Header, Footer, IntroTypewriter, ContactForm, …
    ui/                   # shadcn base + composants atomiques
  lib/
    contact/              # schema, handler pur, ip-hash, rate-limit, turnstile, email
    supabase/             # server (service_role) + browser clients + types
    projects.ts           # Reader Markdown filesystem
    markdown.ts           # unified/rehype-sanitize pipeline
  proxy.ts                # Next 16 "proxy" (anciennement middleware) — CSP nonces
content/projects/         # Projets en Markdown + front-matter YAML
supabase/migrations/      # SQL source of truth
tests/
  e2e/                    # Playwright smoke
  setup.ts                # bootstrap jest-dom
```

---

## Licence

© Camille Saquet. Le code du site est personnel ; les projets référencés peuvent être sous NDA (marqués `[REDACTED — NDA]` sur leur page).

Contact : **camille@breaktheloop.site**
