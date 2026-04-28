# BREAK THE LOOP

Arène red team IA orientée cybersécurité. Inspirée de Gandalf (Lakera) et HackAPrompt, mais ciblée cyber : SOC, pentest, IDS, malware analysis.

> **Probe · Exploit · Comprendre.**
> Tu n'es pas l'utilisateur. Tu es l'adversaire.

Site : <https://breaktheloop.fr>

---

## Stack

| Couche | Choix |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict |
| Style | Tailwind v4 CSS-first · JetBrains Mono + Space Grotesk (self-hosted) |
| LLM | Google Gemini 2.5 Flash (primary) + Cerebras Llama 3.3 70B (judges) + OpenRouter (fallback) — **tous free tier** |
| Auth | Supabase Auth — magic link email + Google OAuth |
| DB | Supabase Postgres + RLS forcée + vue matérialisée leaderboard |
| Rate limit | Upstash Redis — 10 probes/h/(challenge,IP) + 50 tentatives/jour/user |
| Validation | Zod côté serveur, scoring HackAPrompt-style (`base × diff × efficiency × persistence`) |
| Hébergement | VPS IONOS (Ubuntu 24.04) — Nginx + PM2 + certbot |
| Cron | systemd timers (refresh leaderboard 5min · sync challenges 1×/jour) |

---

## Structure

```
src/
  app/
    page.tsx                    # Landing
    arena/                      # Liste tutos + page challenge interactive
    auth/{signin,callback}/     # Magic link + Google OAuth
    profile/                    # Stats utilisateur
    leaderboard/                # Top 100
    api/
      arena/{probe,submit}/     # POST — interroge / valide
      cron/                     # refresh-leaderboard + sync-challenges
  components/
    arena/ChallengeTerminal.tsx # UI terminal avec probe/submit/telemetrie
    landing/                    # Hero glitch, ConsoleStrip, TypesGrid…
    site/{Nav,TopBar}.tsx
  lib/
    auth/                       # Supabase server + middleware refresh
    challenges/                 # Schema Zod, validators, scoring, catalog
    llm/                        # Providers (Gemini/Cerebras/OpenRouter) + router
    security/                   # ip-hash + rate-limit Upstash
content/
  challenges/{tutorial,daily-pool}.ts  # 10 tutos + 5 daily seed
deploy/
  nginx/                        # vhost + TLS via certbot
  systemd/                      # btl-cron@*.{service,timer}
  scripts/                      # bootstrap.sh + redeploy.sh
supabase/migrations/            # Schema SQL
```

---

## Setup local (dev)

```bash
pnpm install
cp .env.example .env.local
# → remplir Supabase + LLM keys + Upstash + secrets
pnpm dev   # http://localhost:3000
```

Sans Supabase configuré : la landing fonctionne, l'arène redirige vers `/auth/signin` qui crashera. Pour tester l'auth, configure d'abord un projet Supabase.

Sans LLM keys : la landing + auth fonctionnent ; les routes `/api/arena/*` renvoient `PROVIDER_UNAVAILABLE`.

---

## Free tier — où récupérer les clés

| Service | URL | Limite gratuite |
| --- | --- | --- |
| Supabase | <https://supabase.com> | 50k MAU, 500MB DB, EU region |
| Gemini | <https://aistudio.google.com/apikey> | 1500 req/jour |
| Cerebras | <https://cloud.cerebras.ai> | 1M tok/jour, 30 req/min |
| OpenRouter | <https://openrouter.ai/keys> | 200 req/jour sur modèles `:free` |
| Upstash Redis | <https://console.upstash.com/redis> | 10k commandes/jour |

Aucune CB exigée chez aucun.

---

## Déploiement VPS (Ubuntu 24.04 — IONOS)

Vois [deploy/DEPLOY.md](deploy/DEPLOY.md) pour la procédure pas-à-pas.

TL;DR :

```bash
ssh root@<vps-ip>
git clone https://github.com/<user>/breaktheloop.git /tmp/btl-bootstrap
bash /tmp/btl-bootstrap/deploy/scripts/bootstrap.sh
# → édite /var/www/btl/.env.production avec tes clés
# → re-run: cd /var/www/btl && pnpm install --frozen-lockfile && pnpm build && pm2 reload btl
```

Updates ultérieures :

```bash
ssh root@<vps-ip> "bash /var/www/btl/deploy/scripts/redeploy.sh"
```

---

## Sécurité

- **CSP strict** avec nonces per-request, `strict-dynamic`, `frame-ancestors 'none'`.
- **HSTS** `max-age=63072000; includeSubDomains; preload`.
- **COOP/CORP** `same-origin`, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, Permissions-Policy minimaliste.
- **RLS Postgres forcée**, `REVOKE ALL` de `anon`/`authenticated` sur `attempts`, service_role uniquement côté serveur.
- **CHECK constraints** au niveau DB (longueurs, regex handle, hash 64 chars).
- **SHA-256 salé** pour les IPs (jamais en clair). Sel ≥ 32 chars enforced runtime.
- **Rate limit** 10 probes/h/(challenge,IP) + 50 tentatives/jour/user via Upstash.
- **Validation success TOUJOURS server-side** (le client ne peut pas tricher).
- **System prompts JAMAIS exposés au client** (route serveur uniquement).
- **`server-only` import** sur les modules touchant service_role + LLM keys.

---

## Disclaimer légal

Environnement contrôlé. Les techniques apprises ici **ne doivent pas être utilisées sur des systèmes en production sans autorisation écrite** du propriétaire. Aucun contenu utilisateur n'est partagé publiquement sans le handle de l'opérateur. Les payloads sont stockés sous forme de hash SHA-256 ; les IPs sont saltées.

---

## Crédits

- Inspiration : [HackAPrompt](https://www.hackaprompt.com/) (Sander Schulhoff et al.) · [Gandalf](https://gandalf.lakera.ai/) (Lakera).
- Stack free-tier 2026 : Google AI Studio · Cerebras · OpenRouter · Supabase · Upstash.
- © Camille Saquet — `camille@breaktheloop.fr`
