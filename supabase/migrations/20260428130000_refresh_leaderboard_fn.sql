-- Postgres function consumed by /api/cron/refresh-leaderboard.
-- Service-role only; RPC will reject anon/authenticated calls.

create or replace function public.refresh_leaderboard()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  refresh materialized view public.leaderboard_alltime;
end;
$$;

revoke execute on function public.refresh_leaderboard() from public, anon, authenticated;
grant  execute on function public.refresh_leaderboard() to service_role;
