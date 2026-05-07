"use client";
import { AtReportSchema } from "@/lib/schemas/at-report";
import { AutoReportSchema } from "@/lib/schemas/auto-report";
import { type Processo, type ProcessoTipo } from "@/lib/types";

const KEY = "bento.processos.v1";

type Store = Record<string, Processo>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

function write(store: Store): void {
  window.localStorage.setItem(KEY, JSON.stringify(store));
}

export function listProcessos(): Processo[] {
  const store = read();
  return Object.values(store).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getProcesso(id: string): Processo | null {
  return read()[id] ?? null;
}

export function createProcesso(tipo: ProcessoTipo): Processo {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const base = {
    id,
    titulo: "",
    createdAt: now,
    updatedAt: now,
  };
  const processo: Processo =
    tipo === "AT"
      ? { ...base, tipo: "AT", data: AtReportSchema.parse({ tipo: "AT" }) }
      : { ...base, tipo: "AUTO", data: AutoReportSchema.parse({ tipo: "AUTO" }) };
  const store = read();
  store[id] = processo;
  write(store);
  return processo;
}

export function updateProcesso(p: Processo): Processo {
  const next = { ...p, updatedAt: new Date().toISOString() };
  const store = read();
  store[p.id] = next;
  write(store);
  return next;
}

export function deleteProcesso(id: string): void {
  const store = read();
  delete store[id];
  write(store);
}
