"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { SparkleIcon } from "@/components/ui/sparkle-icon";
import { AudioRecorder } from "./audio-recorder";
import { callAi } from "@/lib/client/api";

type Fragmento = { seccaoId: string; fragmento: string };

type Props = {
  tipo: "AT" | "AUTO";
  onApply: (seccaoId: string, value: string, mode: "replace" | "append") => void;
};

export function GlobalRouterDialog({ tipo, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [routing, setRouting] = useState(false);
  const [fragmentos, setFragmentos] = useState<Fragmento[]>([]);
  const toast = useToast();

  function appendInput(text: string) {
    setInput((prev) => (prev.trim() ? `${prev.trim()}\n\n${text}` : text));
  }

  async function handleRoute() {
    if (!input.trim()) {
      toast("Adiciona algum texto antes de distribuir.", "error");
      return;
    }
    setRouting(true);
    try {
      const res = await callAi("/api/routear-input", { tipo, inputBruto: input });
      const json = await res.json();
      if (!res.ok) {
        toast(`Erro a distribuir: ${json.error ?? "desconhecido"}`, "error");
        return;
      }
      const f = (json.fragmentos as Fragmento[] | undefined) ?? [];
      if (f.length === 0) {
        toast("Modelo não identificou nenhum fragmento aplicável.", "error");
      }
      setFragmentos(f);
    } catch {
      toast("Erro a chamar o modelo", "error");
    } finally {
      setRouting(false);
    }
  }

  function reset() {
    setInput("");
    setFragmentos([]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-violet-300 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-800 hover:border-violet-400 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200 dark:hover:bg-violet-900"
      >
        <SparkleIcon className="h-4 w-4" />
        Distribuir input
      </button>
      <Modal
        open={open}
        size="xl"
        onClose={() => {
          setOpen(false);
          reset();
        }}
        title="Distribuir input por secções"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:border-zinc-400 dark:border-zinc-700"
            >
              Fechar
            </button>
            {fragmentos.length === 0 && (
              <button
                type="button"
                onClick={handleRoute}
                disabled={routing || !input.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >
                <SparkleIcon className="h-3.5 w-3.5 text-white" />
                {routing ? "A distribuir…" : "Distribuir"}
              </button>
            )}
          </>
        }
      >
        {fragmentos.length === 0 ? (
          <>
            <p className="mb-3 text-xs text-zinc-500">
              Cola/escreve/dita um bloco de texto sobre o caso. O Claude divide em fragmentos e
              propõe a que secção do relatório cada um pertence. Tu decides aplicar ou descartar.
            </p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
              placeholder="Notas de campo, transcrição, depoimento…"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <div className="mt-3 flex items-center gap-2">
              <AudioRecorder onTranscript={appendInput} />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="ml-auto text-xs text-zinc-400 hover:text-red-600"
                >
                  Limpar
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="mb-3 text-xs text-zinc-500">
              {fragmentos.length} fragmento(s) propostos. Aplica os que achares relevantes.
            </p>
            <ul className="space-y-3">
              {fragmentos.map((f, i) => (
                <li
                  key={i}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <div className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    {f.seccaoId}
                  </div>
                  <p className="text-sm text-zinc-800 dark:text-zinc-100">{f.fragmento}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onApply(f.seccaoId, f.fragmento, "replace");
                        toast(`Aplicado a ${f.seccaoId}`, "success");
                      }}
                      className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      Substituir
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onApply(f.seccaoId, f.fragmento, "append");
                        toast(`Acrescentado a ${f.seccaoId}`, "success");
                      }}
                      className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      Acrescentar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={reset}
              className="mt-4 text-xs text-zinc-500 hover:underline"
            >
              ← Voltar e reescrever input
            </button>
          </>
        )}
      </Modal>
    </>
  );
}
