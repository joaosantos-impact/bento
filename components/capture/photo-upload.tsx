"use client";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { callAi } from "@/lib/client/api";

type Props = {
  onAnalysis: (description: string) => void;
  className?: string;
};

export function PhotoUpload({ onAnalysis, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const toast = useToast();

  async function handleFile(file: File) {
    setAnalyzing(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await callAi("/api/analisar-foto", { imageDataUrl: dataUrl });
      const json = await res.json();
      if (!res.ok) {
        toast(`Erro a analisar foto: ${json.error ?? "desconhecido"}`, "error");
        return;
      }
      const descricao = (json.descricao as string | undefined)?.trim();
      if (!descricao) {
        toast("Resposta vazia do modelo de visão", "error");
        return;
      }
      onAnalysis(descricao);
      toast("Foto analisada", "success");
    } catch {
      toast("Erro ao processar foto", "error");
    } finally {
      setAnalyzing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={analyzing}
        className={
          (className ?? "") +
          " inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:border-zinc-400 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        }
      >
        {analyzing ? "A analisar foto…" : "Adicionar foto"}
      </button>
    </>
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
