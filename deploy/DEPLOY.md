# Déploiement BREAK THE LOOP — VPS IONOS

Cible : Ubuntu 24.04, IONOS VPS 6/8/240.
Domaine : `breaktheloop.fr`.

---

## 0. Pré-requis (à faire UNE FOIS, depuis chez toi)

### 0.a — Sécuriser l'accès SSH (CRITIQUE)

```bash
# Sur ton Mac
ssh-keygen -t ed25519 -C "camille@breaktheloop" -f ~/.ssh/btl_vps -N ""
ssh-copy-id -i ~/.ssh/btl_vps.pub root@82.165.48.64

# Connecte-toi avec la clé
ssh -i ~/.ssh/btl_vps root@82.165.48.64

# Sur le VPS — désactive le mot de passe (garder une autre session ouverte au cas où)
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl reload ssh
```

### 0.b — DNS chez ton registrar

Pointer `breaktheloop.fr` (apex) **et** `www.breaktheloop.fr` sur l'IP `82.165.48.64` (A record).

```
A   breaktheloop.fr      82.165.48.64
A   www.breaktheloop.fr  82.165.48.64
```

Vérifie : `dig +short breaktheloop.fr` doit renvoyer `82.165.48.64`.

### 0.c — Comptes externes (free tier)

Créer **avant** de toucher au VPS :

1. **Supabase** — <https://supabase.com> → New project (region EU, Frankfurt). Note :
   - `Project URL`
   - `anon public key`
   - `service_role key`
2. Dans Supabase, **Authentication → Providers** :
   - Activer **Email** (magic link)
   - Activer **Google** : créer un projet GCP, OAuth client web, ajouter les redirect URIs Supabase indiqués dans la doc
3. Dans Supabase, **Database → Migrations** → exécuter le SQL de `supabase/migrations/20260428120000_arena_schema.sql`
4. **Google AI Studio** — <https://aistudio.google.com/apikey> → créer une clé Gemini.
5. **Cerebras** — <https://cloud.cerebras.ai> → API Key.
6. **OpenRouter** — <https://openrouter.ai/keys> → API key (free tier).
7. **Upstash** — <https://console.upstash.com/redis> → REST API → URL + token.

Note : tu peux skipper Cerebras et OpenRouter au début — Gemini seul suffit pour les types `forbidden-phrase` et `flag-extract` (les juges utilisent OpenRouter en fallback).

---

## 1. Bootstrap initial du VPS

```bash
ssh -i ~/.ssh/btl_vps root@82.165.48.64

# Cloner le repo dans /tmp pour récupérer le bootstrap
git clone https://github.com/<TON_USER>/breaktheloop.git /tmp/btl-bootstrap
BTL_REPO=https://github.com/<TON_USER>/breaktheloop.git \
BTL_REF=main \
bash /tmp/btl-bootstrap/deploy/scripts/bootstrap.sh
```

Le script :
1. Met à jour Ubuntu
2. Installe Node 20, pnpm 10.33, PM2, nginx, certbot, ufw, fail2ban
3. Ouvre le firewall (22/80/443)
4. Clone ton repo dans `/var/www/btl`
5. Crée `.env.production` (template — il s'arrête là pour te laisser le remplir)

---

## 2. Remplir `.env.production`

```bash
vim /var/www/btl/.env.production
```

Remplis avec les valeurs notées en étape 0.c. Le `CRON_SECRET` est déjà généré dans `/etc/btl/cron.env`, recopie-le.

```env
NEXT_PUBLIC_SITE_URL=https://breaktheloop.fr

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

GEMINI_API_KEY=AIzaSy...
CEREBRAS_API_KEY=cs-...
OPENROUTER_API_KEY=sk-or-...

UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AY...

SECRET_IP_SALT=$(openssl rand -hex 32)
SCORE_HMAC_SECRET=$(openssl rand -hex 32)
CRON_SECRET=<copy from /etc/btl/cron.env>
```

```bash
chmod 600 /var/www/btl/.env.production
```

---

## 3. Lancer le bootstrap final

```bash
cd /var/www/btl
bash deploy/scripts/bootstrap.sh   # ré-exécute, cette fois ça va build
```

Cette deuxième passe :
- Installe les deps + build Next.js
- Démarre PM2 sur le port 3000
- Configure nginx + obtient le certificat TLS via certbot
- Active les systemd timers (refresh leaderboard / sync challenges)

À la fin, ouvre <https://breaktheloop.fr> — la landing doit s'afficher.

---

## 4. Sync initial des challenges en DB

```bash
# Pousser les 10 tutos + 5 daily-pool dans la table challenges
curl -X POST https://breaktheloop.fr/api/cron/sync-challenges \
     -H "authorization: Bearer $(grep CRON_SECRET /etc/btl/cron.env | cut -d= -f2)"
# → {"ok":true,"synced":15}
```

---

## 5. Vérifications

```bash
# PM2
pm2 status
pm2 logs btl --lines 30

# Nginx
nginx -t && systemctl status nginx

# Cron timers
systemctl list-timers 'btl-*'

# Headers de sécurité (depuis chez toi)
curl -sI https://breaktheloop.fr | grep -E '(content-security-policy|strict-transport)'

# Crée un compte test (magic link sur ton email perso) → essaie un tuto
```

---

## 6. Mises à jour ultérieures

```bash
# Depuis ton Mac
git push origin main
ssh -i ~/.ssh/btl_vps root@82.165.48.64 "bash /var/www/btl/deploy/scripts/redeploy.sh"
```

Ou en CI : ajouter un GitHub Action `.github/workflows/deploy.yml` qui SSH-rebuild sur push main (après avoir mis la clé privée `btl_vps` dans les secrets GitHub).

---

## Troubleshooting

**`502 Bad Gateway`** → PM2 down. `pm2 restart btl && pm2 logs btl`.

**`PROVIDER_UNAVAILABLE`** dans l'arène → check les quotas Gemini/Cerebras dans leurs dashboards. Vérifie que `GEMINI_API_KEY` est bien dans `.env.production`.

**`AUTH_REQUIRED`** sur les API alors que tu es co → vérifie que les cookies Supabase passent bien (Nginx forwarde-t-il `Host` et `X-Forwarded-Proto` ? oui par défaut dans le vhost).

**Certbot fail** → DNS pas encore propagé. Attends 10 min, retente : `certbot --nginx -d breaktheloop.fr -d www.breaktheloop.fr`.

**Email magic link arrive pas** → Supabase dashboard → Authentication → Email templates → vérifie le sender. En dev, Supabase envoie via leur SMTP par défaut (3/h cap). En prod, configure SendGrid/Resend dans Auth → SMTP Settings.
