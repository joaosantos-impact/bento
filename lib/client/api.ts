"use client";
import { getSettings } from "@/lib/storage/settings";

// All AI calls go through here so the browser-stored OpenRouter settings get
// forwarded to the server. The server uses these headers in priority over
// process.env.* so a single user can override locally without touching .env.
export async function callAi(path: string, body: unknown): Promise<Response> {
  const s = getSettings();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (s.openrouterKey?.trim()) headers["X-Openrouter-Key"] = s.openrouterKey.trim();
  if (s.openrouterModel?.trim()) headers["X-Openrouter-Model"] = s.openrouterModel.trim();
  return fetch(path, { method: "POST", headers, body: JSON.stringify(body) });
}
