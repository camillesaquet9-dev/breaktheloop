import type { ChallengeDef } from "./schema";

/**
 * HackAPrompt-inspired scoring.
 *
 *   score = base_points
 *         × difficulty
 *         × (0.4 + 0.6 × efficiency_factor)   // 40% floor, 60% earned
 *         × persistence_penalty                // 1.0, 0.85, 0.70, 0.55, 0.40, 0.30
 *
 * efficiency_factor = max(0, 5000 - inputTokens) / 5000
 * persistence_penalty = max(0.3, 1 - (attemptN - 1) * 0.15)
 */
export function computeScore(args: {
  challenge: Pick<ChallengeDef, "basePoints" | "difficulty">;
  inputTokens: number;
  attemptN: number;
  isDaily?: boolean;
}): number {
  const { challenge, inputTokens, attemptN, isDaily } = args;
  const efficiency = Math.max(0, (5000 - inputTokens) / 5000);
  const persistence = Math.max(0.3, 1 - (attemptN - 1) * 0.15);
  const raw =
    challenge.basePoints * challenge.difficulty * (0.4 + 0.6 * efficiency) * persistence;
  return Math.round(raw * (isDaily ? 2 : 1));
}
