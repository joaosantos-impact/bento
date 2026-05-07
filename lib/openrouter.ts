import OpenAI from "openai";

export const DEFAULT_MODEL_FALLBACK = "anthropic/claude-sonnet-4.6";
export const HEAVY_MODEL_FALLBACK = "anthropic/claude-opus-4.7";

export type RuntimeConfig = {
  apiKey?: string;
  model?: string;
  modelHeavy?: string;
};

// Reads HTTP headers (set client-side from /settings) with fallback to env vars.
export function configFromHeaders(headers: Headers): RuntimeConfig {
  return {
    apiKey: headers.get("x-openrouter-key") || undefined,
    model: headers.get("x-openrouter-model") || undefined,
    modelHeavy: headers.get("x-openrouter-model-heavy") || undefined,
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

export function resolveModel(config: RuntimeConfig, heavy = false): string {
  if (heavy) {
    return config.modelHeavy || process.env.OPENROUTER_MODEL_HEAVY || HEAVY_MODEL_FALLBACK;
  }
  return config.model || process.env.OPENROUTER_MODEL || DEFAULT_MODEL_FALLBACK;
}
