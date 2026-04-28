import "server-only";
import {
  type LLMCallInput,
  type LLMCallResult,
  type LLMProvider,
  LLMProviderError,
  LLMQuotaError,
} from "../types";

const MODEL = "llama-3.3-70b";
const ENDPOINT = "https://api.cerebras.ai/v1/chat/completions";

/**
 * Cerebras — Llama 3.3 70B, OpenAI-compatible API.
 * Free tier (Apr 2026): 1M tok/jour, 30 req/min, 60-100K tok/min.
 * Used as the default judge runner because the throughput is generous.
 */
export const cerebrasProvider: LLMProvider = {
  name: "cerebras",
  defaultModel: MODEL,
  isConfigured() {
    return Boolean(process.env.CEREBRAS_API_KEY);
  },
  async call(input: LLMCallInput): Promise<LLMCallResult> {
    const key = process.env.CEREBRAS_API_KEY;
    if (!key) throw new LLMQuotaError("cerebras", "CEREBRAS_API_KEY not set");

    const t0 = Date.now();
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.user },
        ],
        temperature: input.temperature ?? 0.6,
        max_tokens: input.maxOutputTokens ?? 600,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const latencyMs = Date.now() - t0;

    if (res.status === 429) throw new LLMQuotaError("cerebras", "rate limited (429)");
    if (!res.ok) throw new LLMProviderError("cerebras", res.status, await res.text());

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    return {
      text: json.choices?.[0]?.message?.content ?? "",
      inputTokens: json.usage?.prompt_tokens ?? 0,
      outputTokens: json.usage?.completion_tokens ?? 0,
      provider: "cerebras",
      model: MODEL,
      latencyMs,
    };
  },
};
