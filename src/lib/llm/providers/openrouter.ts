import "server-only";
import {
  type LLMCallInput,
  type LLMCallResult,
  type LLMProvider,
  LLMProviderError,
  LLMQuotaError,
} from "../types";

// OpenRouter: pick a free, stable model.  DeepSeek R1 distill is a good default
// for adversarial scenarios because it's verbose and creative under pressure.
const MODEL = "deepseek/deepseek-r1-0528:free";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export const openrouterProvider: LLMProvider = {
  name: "openrouter",
  defaultModel: MODEL,
  isConfigured() {
    return Boolean(process.env.OPENROUTER_API_KEY);
  },
  async call(input: LLMCallInput): Promise<LLMCallResult> {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new LLMQuotaError("openrouter", "OPENROUTER_API_KEY not set");

    const t0 = Date.now();
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
        "http-referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://breaktheloop.fr",
        "x-title": "BREAK THE LOOP",
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
      signal: AbortSignal.timeout(20_000),
    });
    const latencyMs = Date.now() - t0;

    if (res.status === 429) throw new LLMQuotaError("openrouter", "rate limited (429)");
    if (!res.ok) throw new LLMProviderError("openrouter", res.status, await res.text());

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    return {
      text: json.choices?.[0]?.message?.content ?? "",
      inputTokens: json.usage?.prompt_tokens ?? 0,
      outputTokens: json.usage?.completion_tokens ?? 0,
      provider: "openrouter",
      model: MODEL,
      latencyMs,
    };
  },
};
