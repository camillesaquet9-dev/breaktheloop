import { z } from "zod";

/** Challenge file (TS module) shape — see content/challenges/*.ts. */
export const challengeDef = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]{3,60}$/),
    title: z.string().min(3).max(80),
    vector: z.enum(["prompt-injection", "system-extraction", "defense", "agent-exploitation"]),
    difficulty: z.number().int().min(1).max(5),
    type: z.enum(["forbidden-phrase", "flag-extract", "judge-vote"]),
    basePoints: z.number().int().min(50).max(1000).default(100),
    isTutorial: z.boolean().default(false),
    isDailyPool: z.boolean().default(false),

    /** The system prompt for the *target* LLM.  NEVER sent to the client. */
    systemPrompt: z.string().min(20),
    /** Player-visible mission brief (markdown allowed in UI). */
    brief: z.string().min(20),
    /** What the user has to submit / how to win. */
    objective: z.string().min(5),

    // Validator-specific fields (exactly one block must be set, matched at runtime).
    targetPhrase: z.string().optional(),
    flagPattern: z.string().optional(),
    judgeRubric: z.string().optional(),

    /** Optional hint shown after N failed attempts. */
    hint: z.string().optional(),
    hintAfterFailures: z.number().int().min(1).max(20).default(3),

    /** Hard cap on the player's input. */
    maxInputTokens: z.number().int().min(80).max(2000).default(800),

    /** Provider preference — falls back through the chain in router.ts. */
    providerHint: z.enum(["gemini", "cerebras", "openrouter"]).optional(),
  })
  .superRefine((c, ctx) => {
    if (c.type === "forbidden-phrase" && !c.targetPhrase) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "forbidden-phrase challenges require targetPhrase",
      });
    }
    if (c.type === "flag-extract" && !c.flagPattern) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "flag-extract challenges require flagPattern",
      });
    }
    if (c.type === "judge-vote" && !c.judgeRubric) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "judge-vote challenges require judgeRubric",
      });
    }
  });

export type ChallengeDef = z.infer<typeof challengeDef>;
/** Input type — defaults are optional here, matched at parse time. */
export type ChallengeInput = z.input<typeof challengeDef>;

/** Public-facing slice — what the client is allowed to see. */
export type ChallengePublic = Pick<
  ChallengeDef,
  | "slug"
  | "title"
  | "vector"
  | "difficulty"
  | "type"
  | "basePoints"
  | "brief"
  | "objective"
  | "maxInputTokens"
  | "isTutorial"
  | "isDailyPool"
> & { hasHint: boolean };

export function toPublic(c: ChallengeDef): ChallengePublic {
  return {
    slug: c.slug,
    title: c.title,
    vector: c.vector,
    difficulty: c.difficulty,
    type: c.type,
    basePoints: c.basePoints,
    brief: c.brief,
    objective: c.objective,
    maxInputTokens: c.maxInputTokens,
    isTutorial: c.isTutorial,
    isDailyPool: c.isDailyPool,
    hasHint: Boolean(c.hint),
  };
}
