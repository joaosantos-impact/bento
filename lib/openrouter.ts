import OpenAI from "openai";

export const DEFAULT_MODEL_FALLBACK = "anthropic/claude-sonnet-4.6";

// Curated list of models surfaced in the /settings dropdown. Keep short and
// opinionated; users can still override via env var if they need an exotic one.
export const MODEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6 (recomendado)" },
  { value: "anthropic/claude-opus-4.7", label: "Claude Opus 4.7 (qualidade máxima)" },
  { value: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5 (rápido e barato)" },
  { value: "openai/gpt-5", label: "GPT-5 (OpenAI)" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (Google)" },
];

export type RuntimeConfig = {
  apiKey?: string;
  model?: string;
};

export function configFromHeaders(headers: Headers): RuntimeConfig {
  return {
    apiKey: headers.get("x-openrouter-key") || undefined,
    model: headers.get("x-openrouter-model") || undefined,
  };
}

export function openrouter(config: RuntimeConfig = {}): OpenAI {
  const apiKey = config.apiKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Sem chave OpenRouter configurada. Vai a /settings ou define OPENROUTER_API_KEY no .env.local",
    );
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.OPENROUTER_APP_URL || "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Bento CAPT",
    },
  });
}

export function resolveModel(config: RuntimeConfig): string {
  return config.model || process.env.OPENROUTER_MODEL || DEFAULT_MODEL_FALLBACK;
}
