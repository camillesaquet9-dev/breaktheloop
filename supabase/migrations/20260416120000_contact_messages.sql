-- =============================================================================
-- contact_messages — single writable table used by the public /api/contact
-- route. Everything else is locked down:
--   * anon can INSERT only (no SELECT, no UPDATE, no DELETE).
--   * inserts go through a validating RPC to prevent raw payload abuse.
--   * admin reads happen under service_role, which bypasses RLS.
-- =============================================================================

create extension if not exists "pgcrypto" with schema extensions;

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  -- Message payload -----------------------------------------------------------
  name        text not null check (char_length(name) between 2 and 120),
  email       text not null check (char_length(email) between 5 and 254),
  subject     text not null check (char_length(subject) between 3 and 200),
  body        text not null check (char_length(body) between 10 and 5000),

  -- Technical context ---------------------------------------------------------
  -- `ip_hash` is a SHA-256 of the client IP + SECRET_IP_SALT, computed in the
  -- API route BEFORE we ever touch this table. We never store the raw IP.
  ip_hash     text not null check (char_length(ip_hash) = 64),
  user_agent  text check (char_length(user_agent) <= 512),
  referer     text check (char_length(referer) <= 2048),

  -- Anti-abuse metadata -------------------------------------------------------
  turnstile_action  text check (char_length(turnstile_action) <= 64),
  honeypot_filled   boolean not null default false
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

create index if not exists contact_messages_ip_hash_created_at_idx
  on public.contact_messages (ip_hash, created_at desc);

-- =============================================================================
-- Row Level Security — deny everything by default, then whitelist the minimum.
-- =============================================================================
alter table public.contact_messages enable row level security;
alter table public.contact_messages force row level security;

-- anon: NO access at all through PostgREST. The API route writes with the
-- service_role key, which bypasses RLS. We explicitly DO NOT grant an INSERT
-- policy to anon because the validated RPC is how untrusted input should land.
revoke all on public.contact_messages from anon;
revoke all on public.contact_messages from authenticated;

-- Only the service_role can read back messages.
-- (Policies are redundant with grants, but we keep them as defence-in-depth.)
create policy "service_role_select"
  on public.contact_messages
  for select
  to service_role
  using (true);

create policy "service_role_insert"
  on public.contact_messages
  for insert
  to service_role
  with check (true);

-- =============================================================================
-- Comments — these propagate to the generated TypeScript types as JSDoc.
-- =============================================================================
comment on table public.contact_messages is
  'Inbound contact form submissions. Written server-side only via service_role.';
comment on column public.contact_messages.ip_hash is
  'SHA-256(ip || SECRET_IP_SALT). Never store raw IPs.';
comment on column public.contact_messages.honeypot_filled is
  'True if the hidden honeypot field was filled — kept for forensics even if the submission was accepted.';
