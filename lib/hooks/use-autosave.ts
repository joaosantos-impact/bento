"use client";
import { useEffect, useRef, useState } from "react";

export type AutoSaveStatus = "idle" | "writing" | "saving" | "saved" | "error";

export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => void | Promise<void>,
  options: { delay?: number; enabled?: boolean } = {},
): { status: AutoSaveStatus; lastSavedAt: Date | null } {
  const { delay = 800, enabled = true } = options;
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const onSaveRef = useRef(onSave);
  const isFirstRender = useRef(true);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!enabled) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setStatus("writing");
    const timeout = setTimeout(async () => {
      setStatus("saving");
      try {
        await onSaveRef.current(value);
        setLastSavedAt(new Date());
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay, enabled]);

  return { status, lastSavedAt };
}
