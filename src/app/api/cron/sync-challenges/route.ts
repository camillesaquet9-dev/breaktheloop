import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { getAllChallenges } from "@/lib/challenges/catalog";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Push the in-repo challenge catalogue into the `challenges` table so the
 * FK constraints on `attempts.challenge_slug` and `daily_runs.challenge_slug`
 * are satisfied.  Called from the deploy hook + manual triggers.
 *
 *   curl -X POST https://breaktheloop.fr/api/cron/sync-challenges \
 *        -H "authorization: Bearer $CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET ?? ""}` || !process.env.CRON_SECRET) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();
  const all = getAllChallenges();

  const rows = all.map((c) => ({
    slug: c.slug,
    title: c.title,
    vector: c.vector,
    difficulty: c.difficulty,
    type: c.type,
    base_points: c.basePoints,
    is_tutorial: c.isTutorial,
    is_daily_pool: c.isDailyPool,
    active: true,
  }));

  // biome-ignore lint/suspicious/noExplicitAny: supabase v2 generic typing hassle, schema enforced server-side
  const { error } = await (supabase.from("challenges") as any).upsert(rows, { onConflict: "slug" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, synced: rows.length });
}
