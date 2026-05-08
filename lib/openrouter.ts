import OpenAI from "openai";

export const DEFAULT_MODEL_FALLBACK = "anthropic/claude-3.5-sonnet";

// Last-resort fallback list, used only if the live /api/openrouter/models call
// fails (no key, network error, OpenRouter down). Kept conservative — these IDs
// are the long-stable ones that OpenRouter has supported for years.
export const FALLBACK_MODEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "anthropic/claude-3.5-haiku", label: "Claude 3.5 Haiku" },
  { value: "openai/gpt-4o", label: "GPT-4o" },
  { value: "google/gemini-pro-1.5", label: "Gemini 1.5 Pro" },
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
