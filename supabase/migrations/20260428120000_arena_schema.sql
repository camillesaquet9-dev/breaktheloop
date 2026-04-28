-- =============================================================================
-- BREAK THE LOOP — arena schema v1
-- profiles, challenges (catalog), attempts, daily_runs, leaderboard view
-- RLS forced everywhere.  service_role only on the server.
-- =============================================================================

set check_function_bodies = off;

-- ---------- Profiles (extend auth.users) ------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null check (handle ~ '^[a-z0-9_.]{3,20}$'),
  display_name text check (display_name is null or length(display_name) <= 40),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select using (true);

create policy "users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- A profile is created automatically on signup (handle = 'op_' + first 8 of uuid)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_handle text;
  candidate text;
  attempt int := 0;
begin
  base_handle := lower(regexp_replace(coalesce(new.email, ''), '[^a-z0-9]+', '', 'g'));
  if length(base_handle) < 3 then
    base_handle := 'op_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  base_handle := substr(base_handle, 1, 16);

  candidate := base_handle;
  while exists (select 1 from public.profiles where handle = candidate) loop
    attempt := attempt + 1;
    candidate := substr(base_handle, 1, 16 - length(attempt::text)) || attempt::text;
    exit when attempt > 99;
  end loop;

  insert into public.profiles (id, handle) values (new.id, candidate);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Challenge catalogue --------------------------------------------
create table public.challenges (
  slug text primary key check (slug ~ '^[a-z0-9-]{3,60}$'),
  title text not null,
  vector text not null check (vector in
    ('prompt-injection', 'system-extraction', 'defense', 'agent-exploitation')),
  difficulty smallint not null check (difficulty between 1 and 5),
  type text not null check (type in
    ('forbidden-phrase', 'flag-extract', 'judge-vote')),
  base_points int not null default 100,
  is_tutorial boolean not null default false,
  is_daily_pool boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.challenges enable row level security;

create policy "challenges are publicly readable"
  on public.challenges for select using (active = true);

-- ---------- Daily runs ------------------------------------------------------
create table public.daily_runs (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  challenge_slug text not null references public.challenges(slug),
  rotated_at timestamptz not null default now()
);
alter table public.daily_runs enable row level security;

create policy "daily runs are publicly readable"
  on public.daily_runs for select using (true);

-- ---------- Attempts --------------------------------------------------------
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_slug text not null references public.challenges(slug),
  daily_run_id uuid references public.daily_runs(id) on delete set null,
  payload_hash text not null check (length(payload_hash) = 64),
  input_tokens int not null check (input_tokens >= 0),
  output_excerpt text check (output_excerpt is null or length(output_excerpt) <= 240),
  judges_votes jsonb,
  success boolean not null,
  score int not null default 0,
  ip_hash text not null check (length(ip_hash) = 64),
  created_at timestamptz not null default now()
);
alter table public.attempts enable row level security;
create index attempts_user_recent_idx on public.attempts(user_id, created_at desc);
create index attempts_challenge_score_idx on public.attempts(challenge_slug, success, score desc);

create policy "users read own attempts"
  on public.attempts for select using (auth.uid() = user_id);

-- (No INSERT/UPDATE/DELETE policies for anon/authenticated -> service_role only.)

-- ---------- Best score per (user, challenge) -------------------------------
-- Used by the leaderboard so a player can't farm the same challenge for points.
create or replace view public.user_best_scores as
select
  user_id,
  challenge_slug,
  max(score) filter (where success) as best_score,
  bool_or(success) as solved,
  min(created_at) filter (where success) as first_solved_at
from public.attempts
group by user_id, challenge_slug;

-- Materialised leaderboard (refreshed every 5 min by a cron).
create materialized view public.leaderboard_alltime as
select
  p.id as user_id,
  p.handle,
  count(*) filter (where ubs.solved) as challenges_solved,
  coalesce(sum(ubs.best_score), 0) as total_score,
  max(ubs.first_solved_at) as last_breach
from public.profiles p
left join public.user_best_scores ubs on ubs.user_id = p.id
group by p.id, p.handle
order by total_score desc nulls last;

create unique index leaderboard_alltime_user_idx on public.leaderboard_alltime(user_id);

-- ---------- Permissions ----------------------------------------------------
revoke all on public.attempts from anon, authenticated;
grant select on public.attempts to authenticated; -- still RLS-gated to own rows

revoke all on public.challenges from anon, authenticated;
grant select on public.challenges to anon, authenticated;

revoke all on public.daily_runs from anon, authenticated;
grant select on public.daily_runs to anon, authenticated;

revoke all on public.profiles from anon;
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

grant select on public.leaderboard_alltime to anon, authenticated;
grant select on public.user_best_scores to authenticated;
