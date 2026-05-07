"use client";
import { useState, type ChangeEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { SparkleIcon } from "@/components/ui/sparkle-icon";
import { AudioRecorder } from "@/components/capture/audio-recorder";
import { PhotoUpload } from "@/components/capture/photo-upload";
import { callAi } from "@/lib/client/api";

type Props = {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  tipo: "AT" | "AUTO";
  seccaoId: string;
  contexto: Record<string, unknown>;
  hint?: string;
};

export function NarrativeField({
  label,
  name,
  value,
  onChange,
  tipo,
  seccaoId,
  contexto,
  hint,
}: Props) {
  const [open, setOpen] = useState(false);
  const [factos, setFactos] = useState("");
  const [generating, setGenerating] = useState(false);
  const toast = useToast();

  function appendFactos(text: string) {
    setFactos((prev) => (prev.trim() ? `${prev.trim()}\n\n${text}` : text));
  }

  async function handleGenerate() {
    if (!factos.trim()) {
      toast("Adiciona alguns factos antes de gerar.", "error");
      return;
    }
    setGenerating(true);
    try {
      const res = await callAi("/api/gerar-secao", {
        tipo,
        seccaoId,
        contexto,
        factos,
      });
      const json = await res.json();
      if (!res.ok) {
        toast(`Erro a gerar: ${json.error ?? "desconhecido"}`, "error");
        return;
      }
      const texto = (json.texto as string | undefined)?.trim();
      if (!texto) {
        toast("Resposta vazia do modelo", "error");
        return;
      }
      onChange(texto);
      setOpen(false);
      setFactos("");
      toast("Secção gerada", "success");
    } catch {
      toast("Erro ao chamar o modelo", "error");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between gap-2">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{label}</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-violet-300 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800 transition hover:border-violet-400 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200 dark:hover:bg-violet-900"
        >
          <SparkleIcon />
          Gerar com IA
        </button>
      </div>
      <textarea
        name={name}
        value={value ?? ""}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
      />
      {hint && <span className="mt-1 block text-xs text-zinc-400">{hint}</span>}

      <Modal
        open={open}
        size="lg"
        onClose={() => setOpen(false)}
        title={`Gerar texto: ${label}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:border-zinc-400 dark:border-zinc-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !factos.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              <SparkleIcon className="h-3.5 w-3.5 text-white" />
              {generating ? "A gerar…" : "Gerar texto"}
            </button>
          </>
        }
      >
        <p className="mb-3 text-xs text-zinc-500">
          Escreve, dita ou anexa fotos com os <strong>factos</strong> deste tópico. O Claude reescreve no estilo
          CAPT, sem inventar nada além do que aqui colocares.
        </p>
        <textarea
          value={factos}
          onChange={(e) => setFactos(e.target.value)}
          rows={8}
          placeholder="Factos brutos (texto solto, datas, declarações, números…)"
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <AudioRecorder onTranscript={(t) => appendFactos(t)} />
          <PhotoUpload onAnalysis={(d) => appendFactos(d)} />
          {factos && (
            <button
              type="button"
              onClick={() => setFactos("")}
              className="text-xs text-zinc-400 hover:text-red-600 ml-auto"
            >
              Limpar
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}
