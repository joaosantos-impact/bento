"use client";

const KEY = "bento.settings.v1";

export type Settings = {
  openrouterKey?: string;
  openrouterModel?: string;
};

export function getSettings(): Settings {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Settings;
  } catch {
    return {};
  }
}

export function saveSettings(next: Settings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearSettings(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function hasOpenRouterKey(): boolean {
  return Boolean(getSettings().openrouterKey?.trim());
}
