"use client";
import { type AutoSaveStatus } from "@/lib/hooks/use-autosave";

type Props = {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  fallbackAt?: string;
};

export function SaveStatus({ status, lastSavedAt, fallbackAt }: Props) {
  const ts = lastSavedAt ?? (fallbackAt ? new Date(fallbackAt) : null);
  const formatted = ts ? ts.toLocaleString("pt-PT") : null;

  let label: string;
  let dotClass: string;
  if (status === "writing") {
    label = "A escrever…";
    dotClass = "bg-amber-400";
  } else if (status === "saving") {
    label = "A guardar…";
    dotClass = "bg-amber-400 animate-pulse";
  } else if (status === "error") {
    label = "Erro a guardar";
    dotClass = "bg-red-500";
  } else if (status === "saved" && formatted) {
    label = `Guardado às ${formatted}`;
    dotClass = "bg-emerald-500";
  } else if (formatted) {
    label = `Última gravação: ${formatted}`;
    dotClass = "bg-zinc-300 dark:bg-zinc-600";
  } else {
    label = "Por gravar";
    dotClass = "bg-zinc-300 dark:bg-zinc-600";
  }

  return (
    <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
      {label}
    </p>
  );
}
