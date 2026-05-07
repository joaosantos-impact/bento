"use client";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { useToast } from "@/components/ui/toast";
import { callAi } from "@/lib/client/api";

export type Attachment = {
  id: string;
  name: string;
  thumbnailUrl: string;
  description?: string;
  analyzing: boolean;
  error?: string;
};

type Props = {
  attachments: Attachment[];
  onChange: (updater: (prev: Attachment[]) => Attachment[]) => void;
};

const ACCEPT = "image/*";

export function AttachmentsZone({ attachments, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const toast = useToast();

  // Listen for paste events (Ctrl+V / Cmd+V) anywhere on the page while mounted.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (!e.clipboardData) return;
      const files: File[] = [];
      for (const item of Array.from(e.clipboardData.items)) {
        if (item.kind === "file") {
          const f = item.getAsFile();
          if (f && f.type.startsWith("image/")) files.push(f);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        void handleFiles(files);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFiles(files: File[]) {
    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      toast("Só aceita imagens por agora.", "error");
      return;
    }
    const newOnes = await Promise.all(
      validFiles.map(async (file) => {
        const dataUrl = await fileToDataUrl(file);
        return {
          id: crypto.randomUUID(),
          name: file.name,
          thumbnailUrl: dataUrl,
          analyzing: true,
        } satisfies Attachment;
      }),
    );
    onChange((prev) => [...prev, ...newOnes]);

    await Promise.all(
      newOnes.map(async (entry) => {
        try {
          const res = await callAi("/api/analisar-foto", { imageDataUrl: entry.thumbnailUrl });
          const json = await res.json();
          if (!res.ok) {
            patchOne(entry.id, { analyzing: false, error: json.error ?? "Erro desconhecido" });
            return;
          }
          const desc = (json.descricao as string | undefined)?.trim();
          if (!desc) {
            patchOne(entry.id, { analyzing: false, error: "Sem descrição devolvida" });
            return;
          }
          patchOne(entry.id, { analyzing: false, description: desc });
        } catch {
          patchOne(entry.id, { analyzing: false, error: "Falha de rede" });
        }
      }),
    );
  }

  function patchOne(id: string, patch: Partial<Attachment>) {
    onChange((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function remove(id: string) {
    onChange((prev) => prev.filter((a) => a.id !== id));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) void handleFiles(files);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-6 py-8 text-center transition " +
          (dragOver
            ? "border-violet-400 bg-violet-50 dark:border-violet-500 dark:bg-violet-950/40"
            : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500")
        }
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) void handleFiles(files);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
        <p className="text-sm font-medium">Arrasta fotos para aqui</p>
        <p className="text-xs text-zinc-500">
          ou clica para escolher · ou cola com {navigatorIsMac() ? "⌘V" : "Ctrl+V"}
        </p>
      </div>

      {attachments.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex gap-3 rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.thumbnailUrl}
                alt={a.name}
                className="h-20 w-20 shrink-0 rounded object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-xs font-medium" title={a.name}>
                    {a.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    className="text-xs text-zinc-400 hover:text-red-600"
                    aria-label="Remover"
                  >
                    ✕
                  </button>
                </div>
                {a.analyzing && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">A analisar…</p>
                )}
                {a.error && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{a.error}</p>
                )}
                {a.description && (
                  <p className="mt-1 line-clamp-3 text-xs text-zinc-500 dark:text-zinc-400">
                    {a.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

function navigatorIsMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/.test(navigator.platform);
}
