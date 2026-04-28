import "server-only";

import { cerebrasProvider } from "./providers/cerebras";
import { geminiProvider } from "./providers/gemini";
import { openrouterProvider } from "./providers/openrouter";
import {
  type LLMCallInput,
  type LLMCallResult,
  type LLMProvider,
  LLMProviderError,
  LLMQuotaError,
  type ProviderName,
} from "./types";

const PROVIDERS: Record<ProviderName, LLMProvider> = {
  gemini: geminiProvider,
  cerebras: cerebrasProvider,
  openrouter: openrouterProvider,
};

/**
 * Chain of fallbacks for the *target* model (the AI guarding a challenge).
 * Gemini is the primary because the free tier is generous AND the model is
 * defensive enough to make the challenge interesting.  Cerebras / OpenRouter
 * pick up when Gemini saturates.
 */
const TARGET_FALLBACK: ProviderName[] = ["gemini", "cerebras", "openrouter"];

/** Judges always run on Cerebras (60K tok/min lets us fan out 3 calls). */
const JUDGE_PROVIDER: ProviderName = "cerebras";

export async function callTarget(
  input: LLMCallInput,
  preferred?: ProviderName,
): Promise<LLMCallResult> {
  const order = preferred
    ? [preferred, ...TARGET_FALLBACK.filter((p) => p !== preferred)]
    : TARGET_FALLBACK;

  let lastErr: unknown;
  for (const name of order) {
    const provider = PROVIDERS[name];
    if (!provider.isConfigured()) continue;
    try {
      return await provider.call(input);
    } catch (err) {
      lastErr = err;
      // Keep trying on quota or transient HTTP errors.
      if (err instanceof LLMQuotaError) continue;
      if (err instanceof LLMProviderError && (err.status === 429 || err.status >= 500)) continue;
      throw err;
    }
  }
  throw new LLMQuotaError(
    order[0] ?? "gemini",
    `All providers exhausted. Last: ${(lastErr as Error)?.message ?? "unknown"}`,
  );
}

export async function callJudge(input: LLMCallInput): Promise<LLMCallResult> {
  const judge = PROVIDERS[JUDGE_PROVIDER];
  if (!judge.isConfigured()) {
    // Last-ditch: try OpenRouter so judge-vote challenges still work in dev.
    return PROVIDERS.openrouter.call(input);
  }
  return judge.call({ ...input, temperature: 0 });
}

export function listConfiguredProviders(): ProviderName[] {
  return (Object.keys(PROVIDERS) as ProviderName[]).filter((n) => PROVIDERS[n].isConfigured());
}
