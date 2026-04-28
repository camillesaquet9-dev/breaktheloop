export type ProviderName = "gemini" | "cerebras" | "openrouter";

export type LLMMessage = { role: "system" | "user" | "assistant"; content: string };

export type LLMCallInput = {
  system: string;
  user: string;
  /** Hard cap on output tokens. */
  maxOutputTokens?: number;
  /** Sampling temperature.  Default = 0.6 for adversarial robustness. */
  temperature?: number;
};

export type LLMCallResult = {
  text: string;
  inputTokens: number;
  outputTokens: number;
  provider: ProviderName;
  model: string;
  latencyMs: number;
};

export type LLMProvider = {
  name: ProviderName;
  /** Default model identifier reported back in LLMCallResult. */
  defaultModel: string;
  /** Returns null if the provider is not configured (missing API key). */
  isConfigured(): boolean;
  call(input: LLMCallInput): Promise<LLMCallResult>;
};

export class LLMQuotaError extends Error {
  constructor(provider: ProviderName, message: string) {
    super(`[${provider}] ${message}`);
    this.name = "LLMQuotaError";
  }
}

export class LLMProviderError extends Error {
  constructor(
    provider: ProviderName,
    public status: number,
    body: string,
  ) {
    super(`[${provider}] HTTP ${status}: ${body.slice(0, 200)}`);
    this.name = "LLMProviderError";
  }
}
