import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron-triggered: REFRESH MATERIALIZED VIEW leaderboard_alltime.
 * Triggered by a systemd timer on the VPS:
 *   curl -X POST https://breaktheloop.fr/api/cron/refresh-leaderboard \
 *        -H "authorization: Bearer $CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET ?? ""}` || !process.env.CRON_SECRET) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();
  // Postgres fn — see migration; we rely on REFRESH MATERIALIZED VIEW.
  const { error } = await supabase.rpc("refresh_leaderboard");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
