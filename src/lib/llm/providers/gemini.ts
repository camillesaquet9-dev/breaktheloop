import "server-only";
import {
  type LLMCallInput,
  type LLMCallResult,
  type LLMProvider,
  LLMProviderError,
  LLMQuotaError,
} from "../types";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/**
 * Google AI Studio — Gemini 2.5 Flash.
 * Free tier (Apr 2026): 1500 req/jour, 15 req/min.
 */
export const geminiProvider: LLMProvider = {
  name: "gemini",
  defaultModel: MODEL,
  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  },
  async call(input: LLMCallInput): Promise<LLMCallResult> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new LLMQuotaError("gemini", "GEMINI_API_KEY not set");

    const body = {
      systemInstruction: { parts: [{ text: input.system }] },
      contents: [{ role: "user", parts: [{ text: input.user }] }],
      generationConfig: {
        temperature: input.temperature ?? 0.6,
        maxOutputTokens: input.maxOutputTokens ?? 600,
      },
    };

    const t0 = Date.now();
    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      // 15s hard cap so a stuck provider doesn't pin the route handler.
      signal: AbortSignal.timeout(15_000),
    });
    const latencyMs = Date.now() - t0;

    if (res.status === 429) throw new LLMQuotaError("gemini", "rate limited (429)");
    if (!res.ok) throw new LLMProviderError("gemini", res.status, await res.text());

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
    };

    const text =
      json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

    return {
      text,
      inputTokens: json.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: json.usageMetadata?.candidatesTokenCount ?? 0,
      provider: "gemini",
      model: MODEL,
      latencyMs,
    };
  },
};
