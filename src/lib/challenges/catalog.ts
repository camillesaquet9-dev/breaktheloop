import { DAILY_POOL } from "@content/challenges/daily-pool";
import { TUTORIAL_CHALLENGES } from "@content/challenges/tutorial";
import { challengeDef, type ChallengeDef } from "./schema";

const ALL: ChallengeDef[] = [...TUTORIAL_CHALLENGES, ...DAILY_POOL].map((c) =>
  challengeDef.parse(c),
);
const BY_SLUG = new Map<string, ChallengeDef>(ALL.map((c) => [c.slug, c]));

if (BY_SLUG.size !== ALL.length) {
  throw new Error("Duplicate challenge slug detected — slugs must be unique.");
}

export function getAllChallenges(): ChallengeDef[] {
  return ALL;
}

export function getChallenge(slug: string): ChallengeDef | undefined {
  return BY_SLUG.get(slug);
}

export function getTutorialChallenges(): ChallengeDef[] {
  return ALL.filter((c) => c.isTutorial);
}

export function getDailyPool(): ChallengeDef[] {
  return ALL.filter((c) => c.isDailyPool);
}
